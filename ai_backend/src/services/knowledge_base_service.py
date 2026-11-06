import os
import json
import logging
from pathlib import Path
from typing import Optional, Any
import httpx
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from src.schema.knowledge_base_chunk import KnowledgeBaseChunk
from src.services.embedding_service import generate_embedding, generate_batch_embeddings

logger = logging.getLogger("knowledge_base_service")

# Storage Configurations
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_KB_BUCKET = os.getenv("SUPABASE_KB_BUCKET", "knowledge-base")
SUPABASE_KB_PREFIX = os.getenv("SUPABASE_KB_PREFIX", "")

KB_DIR = Path(__file__).resolve().parents[3] / "knowledge_base"


# ---------------------------------------------------------------------------
# Storage / Local File Loading Helpers
# ---------------------------------------------------------------------------
async def load_kb_document(filename: str) -> Optional[dict]:
    """
    Loads knowledge base JSON document:
    1. Loads from local file in `knowledge_base/<filename>` if available.
    2. Otherwise attempts to download from Supabase Object Storage if configured.
    """
    # 1. Local path
    local_path = KB_DIR / filename
    if local_path.exists():
        logger.info(f"[KnowledgeBaseService] Loading '{filename}' from local path: {local_path}")
        with open(local_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # 2. Try Supabase Storage if local file does not exist
    if SUPABASE_URL and SUPABASE_KEY and SUPABASE_KB_BUCKET:
        path_with_prefix = f"{SUPABASE_KB_PREFIX}/{filename}".lstrip("/")
        download_url = f"{SUPABASE_URL}/storage/v1/object/authenticated/{SUPABASE_KB_BUCKET}/{path_with_prefix}"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(download_url, headers=headers)
                if resp.status_code == 200:
                    logger.info(f"[KnowledgeBaseService] Successfully downloaded '{filename}' from Supabase Storage.")
                    return resp.json()
        except Exception as e:
            logger.warning(f"[KnowledgeBaseService] Could not fetch '{filename}' from Supabase Storage: {e}")

    logger.error(f"[KnowledgeBaseService] Knowledge base file '{filename}' not found.")
    return None


def build_chunk_embedding_text(chunk: dict, is_guest: bool) -> str:
    """
    Builds the formatted text string to pass into the embedding model.
    """
    redir = f"\nRedirection: {chunk.get('redirection_link')}" if chunk.get("redirection_link") else ""
    if is_guest:
        return (
            f"Feature Title: {chunk.get('title', '')}\n"
            f"Keywords: {', '.join(chunk.get('keywords', []) or [])}\n"
            f"Content: {chunk.get('content', '')}"
            f"{redir}"
        )
    else:
        return (
            f"Title: {chunk.get('title', '')}\n"
            f"Keywords: {', '.join(chunk.get('keywords', []) or [])}\n"
            f"Page/Module: {chunk.get('page_module', '')}\n"
            f"Content: {chunk.get('content', '')}\n"
            f"Navigation: {chunk.get('navigation_action', '')}"
            f"{redir}"
        )


# ---------------------------------------------------------------------------
# Main Synchronization Pipeline with Version Verification
# ---------------------------------------------------------------------------
async def sync_knowledge_base_pipeline(
    db: AsyncSession,
    force: bool = False,
) -> dict[str, Any]:
    """
    Synchronizes the Knowledge Base:
    - Checks document version from JSON against the version stored in knowledge_base_chunks.
    - If version matches and force=False: skips re-chunking and embedding generation.
    - If version mismatches (or table empty or force=True):
        1. Deletes all old chunks from knowledge_base_chunks for that document (guest vs authenticated).
        2. Generates embeddings for all incoming chunks.
        3. Inserts the new chunks with the updated version.
    """
    stats = {
        "updated_files": [],
        "skipped_files": [],
        "chunks_ingested": 0,
    }

    # The two knowledge base documents: (filename, is_guest)
    kb_files = [
        ("chunks.json", False),
        ("guest_features_chunks.json", True),
    ]

    for filename, is_guest in kb_files:
        doc = await load_kb_document(filename)
        if not doc:
            continue

        # Extract version and chunks list
        if isinstance(doc, dict):
            incoming_version = str(doc.get("version", "1.0.0"))
            chunks = doc.get("chunks", [])
        elif isinstance(doc, list):
            incoming_version = "1.0.0"
            chunks = doc
        else:
            logger.error(f"[KnowledgeBaseService] Unsupported format in '{filename}'")
            continue

        # 1. Compare version with existing chunks in the table
        stmt = (
            select(KnowledgeBaseChunk.version)
            .where(KnowledgeBaseChunk.is_guest == is_guest)
            .limit(1)
        )
        db_version = (await db.execute(stmt)).scalar_one_or_none()

        # If version matches and not forced, skip!
        if db_version == incoming_version and not force:
            logger.info(
                f"[KnowledgeBaseService] '{filename}' is already at version {incoming_version} in DB. Skipping."
            )
            stats["skipped_files"].append({
                "file": filename,
                "version": incoming_version,
                "reason": "version_match",
            })
            continue

        logger.info(
            f"[KnowledgeBaseService] Version mismatch for '{filename}' "
            f"(DB version: {db_version} -> Incoming version: {incoming_version}). "
            f"Removing old entries and re-chunking..."
        )

        # 2. Remove all old entries for this knowledge base from the table
        await db.execute(
            delete(KnowledgeBaseChunk).where(KnowledgeBaseChunk.is_guest == is_guest)
        )
        await db.commit()

        # 3. Generate embeddings and insert new chunks
        if chunks:
            texts_to_embed = [build_chunk_embedding_text(c, is_guest=is_guest) for c in chunks]
            embeddings = generate_batch_embeddings(texts_to_embed, batch_size=32)

            for c, emb_text, emb_vec in zip(chunks, texts_to_embed, embeddings):
                chunk_id = c.get("chunk_id")
                if not chunk_id:
                    continue

                record = KnowledgeBaseChunk(
                    chunk_id=chunk_id,
                    version=incoming_version,
                    is_guest=is_guest,
                    title=c.get("title", ""),
                    category=c.get("category", "general"),
                    allowed_roles=c.get("allowed_roles") if not is_guest else None,
                    page_module=c.get("page_module") if not is_guest else None,
                    navigation_action=c.get("navigation_action") if not is_guest else None,
                    redirection_link=c.get("redirection_link"),
                    keywords=c.get("keywords"),
                    user_questions=c.get("user_questions"),
                    content=c.get("content", ""),
                    embedding_text=emb_text,
                    embedding=emb_vec,
                )
                db.add(record)

            await db.commit()
            stats["chunks_ingested"] += len(chunks)

        stats["updated_files"].append({
            "file": filename,
            "old_version": db_version,
            "new_version": incoming_version,
            "chunks_stored": len(chunks),
        })

    return stats


# ---------------------------------------------------------------------------
# Vector Retrieval via pgvector (Matching business_profile_service.py)
# ---------------------------------------------------------------------------
async def search_similar_knowledge_chunks(
    db: AsyncSession,
    query: str,
    role: str = "guest",
    limit: int = 3,
) -> list[tuple[KnowledgeBaseChunk, float]]:
    """
    Performs cosine similarity search using pgvector on knowledge_base_chunks.
    Strictly follows the vector distance calculation pattern in business_profile_service.py.
    """
    # Build query vector with instruction
    query_with_instruction = f"Represent this sentence for searching relevant passages: {query}"
    query_vector = generate_embedding(query_with_instruction)

    # pgvector cosine distance & similarity
    distance = KnowledgeBaseChunk.embedding.cosine_distance(query_vector)
    similarity = (1 - distance).label("similarity")

    stmt = select(KnowledgeBaseChunk, similarity).order_by(distance)

    # Role-based gating directly inside the database query
    if role == "guest":
        # Guest gets ONLY guest features chunks (no navigation, feature explanations & contextual redirection)
        stmt = stmt.where(KnowledgeBaseChunk.is_guest.is_(True))
    elif role == "buyer":
        # Buyer gets authenticated chunks where 'buyer' is explicitly in allowed_roles
        stmt = stmt.where(
            KnowledgeBaseChunk.is_guest.is_(False),
            KnowledgeBaseChunk.allowed_roles.contains(["buyer"]),
        )
    else:
        # Entrepreneur / Admin: unrestricted access to all authenticated workspace chunks
        stmt = stmt.where(KnowledgeBaseChunk.is_guest.is_(False))

    stmt = stmt.limit(limit)

    result = await db.execute(stmt)
    return result.all()
