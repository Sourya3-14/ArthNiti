import asyncio
import sys
from pathlib import Path

# Add backend directory to path if run directly
root_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(root_dir))

from src.config.database import AsyncSessionLocal, Base, engine
from src.schema.knowledge_base_chunk import KnowledgeBaseChunk
from src.services.knowledge_base_service import sync_knowledge_base_pipeline


async def main():
    print("==================================================")
    print("  Knowledge Base pgvector Synchronizer & Ingestion")
    print("==================================================")

    force = "--force" in sys.argv
    if force:
        print("[Sync] Force mode enabled: will re-chunk and re-embed all documents regardless of version.")

    # 1. Ensure tables exist
    async with engine.begin() as conn:
        print("[DB] Ensuring knowledge_base tables exist...")
        await conn.run_sync(Base.metadata.create_all)

    # 2. Run sync pipeline
    async with AsyncSessionLocal() as session:
        print("[Sync] Running knowledge base sync pipeline...")
        stats = await sync_knowledge_base_pipeline(session, force=force)
        print(f"[Sync] Synchronization completed!")
        print(f"       Source: {stats.get('source')}")
        print(f"       Updated files: {stats.get('updated_files')}")
        print(f"       Skipped files (already up to date): {stats.get('skipped_files')}")
        print(f"       Total chunks inserted/updated: {stats.get('chunks_ingested')}")

    print("==================================================")


if __name__ == "__main__":
    asyncio.run(main())

