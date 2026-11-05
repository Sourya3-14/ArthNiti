import os
import json
import logging
from pathlib import Path
from typing import Optional, Any
import httpx
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastapi import HTTPException

from src.schema.knowledge_base_chunk import KnowledgeBaseChunk
from src.services.embedding_service import generate_embedding, generate_batch_embeddings

logger = logging.getLogger("knowledge_base_service")

# Storage & Path Configurations
SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_KB_BUCKET = os.getenv("SUPABASE_KB_BUCKET", "knowledge-base")
SUPABASE_KB_PREFIX = os.getenv("SUPABASE_KB_PREFIX", "")

# DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
# LOCAL_MAIN_KB_PATH = DATA_DIR / "chunks.json"
# LOCAL_GUEST_KB_PATH = DATA_DIR / "guest_features_chunks.json"


# ---------------------------------------------------------------------------
# Supabase Object Storage Client
# ---------------------------------------------------------------------------
async def fetch_storage_file_list() -> list[str]:
    """
    Lists file names in the Supabase Object Storage bucket.
    Returns empty list if credentials are not configured or call fails.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.info("[KnowledgeBaseService] Supabase URL or Key not set. Skipping remote bucket listing.")
        return []

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    list_url = f"{SUPABASE_URL}/storage/v1/object/list/{SUPABASE_KB_BUCKET}"
    payload = {
        "prefix": SUPABASE_KB_PREFIX,
        "limit": 100,
        "sortBy": {"column": "name", "order": "asc"},
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(list_url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                file_names = [item["name"] for item in data if item.get("name") and not item.get("id") is None]
                return file_names
            else:
                logger.warning(
                    f"[KnowledgeBaseService] Failed to list bucket '{SUPABASE_KB_BUCKET}': {resp.status_code} - {resp.text}"
                )
                return []
    except Exception as e:
        logger.warning(f"[KnowledgeBaseService] Error connecting to Supabase Object Storage: {e}")
        return []


async def download_storage_file(file_name: str) -> Optional[str]:
    """
    Downloads text content of a file from Supabase Object Storage.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    path_with_prefix = f"{SUPABASE_KB_PREFIX}/{file_name}".lstrip("/")
    download_url = f"{SUPABASE_URL}/storage/v1/object/authenticated/{SUPABASE_KB_BUCKET}/{path_with_prefix}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(download_url, headers=headers)
            if resp.status_code == 200:
                return resp.text
            else:
                logger.warning(
                    f"[KnowledgeBaseService] Failed to download '{file_name}': {resp.status_code}"
                )
                return None
    except Exception as e:
        logger.warning(f"[KnowledgeBaseService] Error downloading '{file_name}': {e}")
        return None


# ---------------------------------------------------------------------------
# Document Chunking & Ingestion Helpers
# ---------------------------------------------------------------------------
def chunk_raw_text_document(
    filename: str,
    text: str,
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> list[dict]:
    """
    Splits raw text or markdown into structured chunks with metadata using RecursiveCharacterTextSplitter.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""],
    )
    docs = splitter.split_text(text)
    base_name = Path(filename).stem.replace("_", " ").title()

    chunks = []
    is_guest = "guest" in filename.lower() or "feature" in filename.lower()

    for idx, doc_text in enumerate(docs):
        chunk_id = f"{Path(filename).stem}_{idx + 1:03d}"
        chunk = {
            "chunk_id": chunk_id,
            "title": f"{base_name} (Part {idx + 1})",
            "category": "features" if is_guest else "general",
            "is_guest": is_guest,
            "allowed_roles": None if is_guest else ["enterpreneur", "buyer", "admin"],
            "page_module": None,
            "navigation_action": None,
            "redirection_link": None,
            "keywords": [base_name.lower()],
            "content": doc_text.strip(),
        }
        chunks.append(chunk)

    return chunks


def build_chunk_embedding_text(chunk: dict, is_guest: bool) -> str:
    """
    Builds the formatted text string to pass into the embedding model.
    """
    if is_guest:
        redir = f"\nRedirection: {chunk.get('redirection_link')}" if chunk.get("redirection_link") else ""
        return (
            f"Feature Title: {chunk.get('title', '')}\n"
            f"Keywords: {', '.join(chunk.get('keywords', []) or [])}\n"
            f"Content: {chunk.get('content', '')}"
            f"{redir}"
        )
    else:
        redir = f"\nRedirection: {chunk.get('redirection_link')}" if chunk.get("redirection_link") else ""
        return (
            f"Title: {chunk.get('title', '')}\n"
            f"Keywords: {', '.join(chunk.get('keywords', []) or [])}\n"
            f"Page/Module: {chunk.get('page_module', '')}\n"
            f"Content: {chunk.get('content', '')}\n"
            f"Navigation: {chunk.get('navigation_action', '')}"
            f"{redir}"
        )


async def ingest_chunk_list(
    db: AsyncSession,
    chunks: list[dict],
    is_guest: bool,
) -> int:
    """
    Batches, generates embeddings for, and persists chunk records to knowledge_base_chunks.
    """
    if not chunks:
        return 0

    texts_to_embed = [build_chunk_embedding_text(c, is_guest=is_guest) for c in chunks]
    embeddings = generate_batch_embeddings(texts_to_embed, batch_size=32)

    inserted_count = 0
    for chunk_data, emb_text, emb_vec in zip(chunks, texts_to_embed, embeddings):
        chunk_id = chunk_data.get("chunk_id")
        if not chunk_id:
            continue

        # Check if record already exists to perform upsert
        stmt = select(KnowledgeBaseChunk).where(KnowledgeBaseChunk.chunk_id == chunk_id)
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            existing.title = chunk_data.get("title", existing.title)
            existing.category = chunk_data.get("category", existing.category)
            existing.is_guest = is_guest
            existing.allowed_roles = chunk_data.get("allowed_roles") if not is_guest else None
            existing.page_module = chunk_data.get("page_module") if not is_guest else None
            existing.navigation_action = chunk_data.get("navigation_action") if not is_guest else None
            existing.redirection_link = chunk_data.get("redirection_link")
            existing.keywords = chunk_data.get("keywords")
            existing.user_questions = chunk_data.get("user_questions")
            existing.content = chunk_data.get("content", "")
            existing.embedding_text = emb_text
            existing.embedding = emb_vec
        else:
            record = KnowledgeBaseChunk(
                chunk_id=chunk_id,
                title=chunk_data.get("title", ""),
                category=chunk_data.get("category", "general"),
                is_guest=is_guest,
                allowed_roles=chunk_data.get("allowed_roles") if not is_guest else None,
                page_module=chunk_data.get("page_module") if not is_guest else None,
                navigation_action=chunk_data.get("navigation_action") if not is_guest else None,
                redirection_link=chunk_data.get("redirection_link"),
                keywords=chunk_data.get("keywords"),
                user_questions=chunk_data.get("user_questions"),
                content=chunk_data.get("content", ""),
                embedding_text=emb_text,
                embedding=emb_vec,
            )
            db.add(record)
        inserted_count += 1

    await db.commit()
    return inserted_count


# ---------------------------------------------------------------------------
# Main Synchronization Pipeline
# ---------------------------------------------------------------------------
async def sync_knowledge_base_pipeline(db: AsyncSession) -> dict[str, Any]:
    """
    Synchronizes the Knowledge Base:
    1. Attempts to list and download docs from Supabase Object Storage bucket.
    2. If files are found in bucket: parses, chunks, embeds, and stores them in pgvector.
    3. If Supabase is not configured or bucket empty: falls back to local data files (chunks.json and guest_features_chunks.json).
    """
    stats = {"supabase_files": 0, "chunks_ingested": 0, "source": "local"}

    storage_files = await fetch_storage_file_list()

    if storage_files:
        stats["supabase_files"] = len(storage_files)
        stats["source"] = "supabase_storage"
        logger.info(f"[KnowledgeBaseService] Found {len(storage_files)} files in Supabase Storage.")

        for filename in storage_files:
            content = await download_storage_file(filename)
            if not content:
                continue

            if filename.endswith(".json"):
                try:
                    data = json.loads(content)
                    if isinstance(data, list):
                        is_guest = "guest" in filename.lower()
                        count = await ingest_chunk_list(db, data, is_guest=is_guest)
                        stats["chunks_ingested"] += count
                except Exception as e:
                    logger.error(f"[KnowledgeBaseService] Failed to parse JSON file '{filename}': {e}")
            elif filename.endswith((".md", ".txt")):
                raw_chunks = chunk_raw_text_document(filename, content)
                is_guest = "guest" in filename.lower()
                count = await ingest_chunk_list(db, raw_chunks, is_guest=is_guest)
                stats["chunks_ingested"] += count

        return stats
    else:
        logger.info("[KnowledgeBaseService] No files found in Supabase Storage. Falling back to local data files.")
        raise HTTPException(status_code=404, detail="No files found in Supabase Storage. Please upload knowledge base files or configure Supabase credentials.")


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

