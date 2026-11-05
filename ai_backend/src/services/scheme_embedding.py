# src/services/scheme_embedding.py
"""
Backward-compatible wrapper for scheme embedding generation.
Delegates to the shared singleton EmbeddingService.
"""

from src.services.embedding_service import (
    DEFAULT_EMBEDDING_MODEL_NAME as MODEL_NAME,
    generate_embedding,
    generate_batch_embeddings,
    get_embedding_model,
)

__all__ = ["MODEL_NAME", "generate_embedding", "generate_batch_embeddings", "get_embedding_model"]
