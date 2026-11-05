import threading
from typing import Optional
from sentence_transformers import SentenceTransformer

# Default model name matching project standard (384 dimensions)
DEFAULT_EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"

_model_instance: Optional[SentenceTransformer] = None
_model_lock = threading.Lock()


def get_embedding_model(model_name: str = DEFAULT_EMBEDDING_MODEL_NAME) -> SentenceTransformer:
    """
    Returns the thread-safe shared singleton instance of SentenceTransformer.
    Ensures model weights are only loaded into memory once across the entire application.
    """
    global _model_instance
    if _model_instance is None:
        with _model_lock:
            if _model_instance is None:
                print(f"[EmbeddingService] Loading shared embedding model: {model_name}...")
                _model_instance = SentenceTransformer(model_name)
                print(f"[EmbeddingService] Shared embedding model loaded successfully.")
    return _model_instance


def generate_embedding(text: str) -> list[float]:
    """
    Generates a normalized 384-dimensional embedding vector for a single string.
    """
    model = get_embedding_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_batch_embeddings(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    """
    Generates normalized embedding vectors for a list of strings in batches.
    """
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return embeddings.tolist()

