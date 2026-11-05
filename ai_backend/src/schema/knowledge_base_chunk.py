import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, Text, Index, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

from src.config.database import Base


class KnowledgeBaseChunk(Base):
    __tablename__ = "knowledge_base_chunks"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    chunk_id = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    is_guest = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    title = Column(
        String(500),
        nullable=False,
    )

    category = Column(
        String(100),
        nullable=True,
        index=True,
    )

    # Allowed roles for authenticated chunks: e.g. ["enterpreneur", "buyer", "admin"]
    allowed_roles = Column(
        JSONB,
        nullable=True,
    )

    page_module = Column(
        String(500),
        nullable=True,
    )

    navigation_action = Column(
        Text,
        nullable=True,
    )

    redirection_link = Column(
        String(500),
        nullable=True,
    )

    keywords = Column(
        JSONB,
        nullable=True,
    )

    user_questions = Column(
        JSONB,
        nullable=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    embedding_text = Column(
        Text,
        nullable=False,
    )

    embedding = Column(
        Vector(384),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index(
            "ix_knowledge_base_chunks_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

