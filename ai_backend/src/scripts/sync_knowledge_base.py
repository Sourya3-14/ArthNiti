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

    # 1. Ensure tables exist
    async with engine.begin() as conn:
        print("[DB] Ensuring knowledge_base_chunks table exists...")
        await conn.run_sync(Base.metadata.create_all)

    # 2. Run sync pipeline
    async with AsyncSessionLocal() as session:
        print("[Sync] Running knowledge base sync pipeline...")
        stats = await sync_knowledge_base_pipeline(session)
        print(f"[Sync] Ingestion completed!")
        print(f"       Source: {stats.get('source')}")
        print(f"       Supabase storage files processed: {stats.get('supabase_files')}")
        print(f"       Total chunks inserted/updated: {stats.get('chunks_ingested')}")

    print("==================================================")


if __name__ == "__main__":
    asyncio.run(main())

