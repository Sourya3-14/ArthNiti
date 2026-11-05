import asyncio
import os
from pathlib import Path

import pandas as pd
from sqlalchemy import select

from src.config.database import AsyncSessionLocal, Base, engine
from src.schema.government_schemes import GovernmentScheme
from src.schema.scheme_embedding import SchemeEmbedding
from src.services.embedding_service import DEFAULT_EMBEDDING_MODEL_NAME as MODEL_NAME, get_embedding_model

CSV_PATH = Path(
    os.getenv(
        "CSV_PATH",
        str(Path(__file__).resolve().parent.parent.parent / "data" / "government_schemes.csv"),
    )
)

model = get_embedding_model()


def clean(value):
    if pd.isna(value):
        return None

    value = str(value).strip()

    if not value:
        return None

    return value


def build_embedding_text(row):
    parts = []

    fields = {
        "Scheme Name": row.get("scheme_name"),
        "Details": row.get("details"),
        "Benefits": row.get("benefits"),
        "Eligibility": row.get("eligibility"),
        "Application": row.get("application"),
        "Documents Required": row.get("documents"),
        "Level": row.get("level"),
        "Scheme Category": row.get("schemeCategory"),
        "Tags": row.get("tags"),
    }

    for label, value in fields.items():
        value = clean(value)

        if value:
            parts.append(f"{label}: {value}")

    return "\n\n".join(parts)


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def ingest_schemes():
    print("Reading CSV...")

    df = pd.read_csv(CSV_PATH)

    print(f"Found {len(df)} rows")

    # Remove completely empty columns
    df = df.dropna(axis=1, how="all")

    print("Creating database tables...")
    await create_tables()

    async with AsyncSessionLocal() as session:
        for index, row in df.iterrows():
            scheme_name = clean(row.get("scheme_name"))

            if not scheme_name:
                print(f"Skipping row {index}: missing scheme name")
                continue

            slug = clean(row.get("slug"))

            # Check for duplicate scheme
            existing = None

            if slug:
                result = await session.execute(
                    select(GovernmentScheme).where(GovernmentScheme.slug == slug)
                )
                existing = result.scalar_one_or_none()

            if existing:
                print(f"Skipping existing scheme: {scheme_name}")
                continue

            embedding_text = build_embedding_text(row)

            print(f"[{index + 1}/{len(df)}] Embedding: {scheme_name}")

            embedding = model.encode(
                embedding_text,
                normalize_embeddings=True,
            )

            scheme = GovernmentScheme(
                scheme_name=scheme_name,
                slug=slug,
                details=clean(row.get("details")),
                benefits=clean(row.get("benefits")),
                eligibility=clean(row.get("eligibility")),
                application=clean(row.get("application")),
                documents=clean(row.get("documents")),
                level=clean(row.get("level")),
                scheme_category=clean(row.get("schemeCategory")),
                tags=clean(row.get("tags")),
                embedding_text=embedding_text,
            )

            session.add(scheme)

            # Generate scheme.id
            await session.flush()

            scheme_embedding = SchemeEmbedding(
                scheme_id=scheme.id,
                embedding=embedding.tolist(),
                model=MODEL_NAME,
            )

            session.add(scheme_embedding)

            # Commit every 50 schemes
            if (index + 1) % 50 == 0:
                await session.commit()
                print("Committed batch")

        await session.commit()

    print("Government scheme ingestion completed.")


async def main():
    try:
        await ingest_schemes()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
