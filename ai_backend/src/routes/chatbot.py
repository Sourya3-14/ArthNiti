import os
import json
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.config import GEMINI_MODEL_NAME
from src.config.database import get_db
from src.middlewares.auth import verify_token
from src.schema.user import User

# ---------------------------------------------------------
# Router & Configuration
# ---------------------------------------------------------
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
KB_FILE_PATH = Path("E:/Hackathon/Finance_Assistant/ai_backend/data/chunks.json")
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"

# Initialize Chat Model with LangChain (.invoke ready)
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL_NAME,
    google_api_key=GEMINI_API_KEY,
    temperature=0.2,
)

# Local sentence transformer
embed_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

# In-memory vector store
knowledge_chunks: list[dict] = []
chunk_embeddings: Optional[np.ndarray] = None


# ---------------------------------------------------------
# Embeddings & Vector Store Functions
# ---------------------------------------------------------
def generate_embedding(text: str) -> list[float]:
    embedding = embed_model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def generate_batch_embeddings(texts: list[str]) -> np.ndarray:
    return embed_model.encode(texts, normalize_embeddings=True, show_progress_bar=False)


def load_knowledge_base_from_file(file_path: Path) -> list[dict]:
    if not file_path.exists():
        raise FileNotFoundError(
            f"Knowledge base file not found at: {file_path.resolve()}"
        )
    if not file_path.is_file():
        raise ValueError(f"Path is not a valid file: {file_path.resolve()}")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Knowledge base JSON root must be an array of chunk objects.")

    return data


def init_onboarding_knowledge_base():
    """Call this function during application startup to load data into memory."""
    global knowledge_chunks, chunk_embeddings

    print(f"[Onboarding Route] Loading KB from: {KB_FILE_PATH.resolve()}")
    knowledge_chunks = load_knowledge_base_from_file(KB_FILE_PATH)
    print(f"[Onboarding Route] Loaded {len(knowledge_chunks)} chunks.")

    documents = []
    for chunk in knowledge_chunks:
        text = (
            f"Title: {chunk.get('title', '')}\n"
            f"Keywords: {', '.join(chunk.get('keywords', []))}\n"
            f"Page/Module: {chunk.get('page_module', '')}\n"
            f"Content: {chunk.get('content', '')}\n"
            f"Navigation: {chunk.get('navigation_action', '')}"
        )
        documents.append(text)

    print(f"[Onboarding Route] Embedding chunks via {EMBEDDING_MODEL_NAME}...")
    chunk_embeddings = generate_batch_embeddings(documents)
    print(
        f"[Onboarding Route] Vector store ready. Matrix shape: {chunk_embeddings.shape}"
    )


def retrieve_relevant_chunks(query: str, top_k: int = 3) -> list[dict]:
    global chunk_embeddings, knowledge_chunks

    if chunk_embeddings is None or not knowledge_chunks:
        init_onboarding_knowledge_base()

    query_with_instruction = (
        f"Represent this sentence for searching relevant passages: {query}"
    )
    query_vector = np.array(generate_embedding(query_with_instruction))

    scores = np.dot(chunk_embeddings, query_vector)
    top_indices = np.argsort(scores)[::-1][:top_k]

    return [knowledge_chunks[idx] for idx in top_indices]


# ---------------------------------------------------------
# Helper to extract plain English string
# ---------------------------------------------------------
def extract_english_field(field_val) -> str:
    """Extracts the English value if field is a dict; otherwise returns string."""
    if isinstance(field_val, dict):
        # Priority: "en" -> first available value -> empty string
        return field_val.get("en") or next(iter(field_val.values()), "")
    return str(field_val or "")


# ---------------------------------------------------------
# Schemas & System Instruction
# ---------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "English"


class SourceChunk(BaseModel):
    chunk_id: str
    title: str
    page_module: str
    navigation_action: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[SourceChunk]


BASE_SITE_ASSISTANT_SYSTEM_INSTRUCTION = """
You are the ArthNiti Site Assistant (Customer Onboarding & Platform Helper).
Greet them properly if they greet you and ask them for queries.
Your primary mission is to help visitors and registered entrepreneurs understand the platform, complete onboarding, locate features, follow recommended workflows, and navigate the site.
Unless users ask specific queries don't try to guide them on onboarding.
First let them tell what they want to know then answer accordingly.

STRICT OPERATIONAL GUARDRAILS:
1. Grounded Answers Only: Answer strictly based on the provided retrieved documentation chunks. If information is not in the context, politely state you do not know and advise reaching out via platform support.
2. No Speculative Business Feasibility Calculations: If a user asks questions like "Will my dairy farm in Bihar make money?" or "Calculate my EMI", explain that as the Site Assistant you do not perform dynamic feasibility studies. Direct them to create a business profile at `/businesses`, open their Business Workspace, and run the Feasibility Analysis and Financial Analysis modules.
3. Assistant Boundaries: Clarify when needed that you are the general Site Assistant. You cannot view their private business ledgers or chat logs. The dedicated in-workspace Business AI Assistant inside `/businesses/:businessId` handles image analysis, invoices, and granular business strategy.
4. Navigation Guidance: When explaining where to go, always mention the direct paths or UI controls (e.g., `/signup`, `/businesses`, left sidebar).
5. Multilingual Output: Respect the user's selected language (e.g., English, Hindi, Bengali) while keeping technical routes intact (e.g., keep `/dashboard` as is).
"""


# ---------------------------------------------------------
# Endpoint
# ---------------------------------------------------------
@router.post("/onboarding", response_model=ChatResponse)
async def chat_onboarding(
    payload: ChatRequest,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Fetch User directly from DB and extract ONLY English values
    user_context = (
        "\nUser Profile Context: Guest (Not Authenticated). "
        "Advise them to sign up or log in if they ask about personalized features."
    )

    if user_id:
        result = await db.execute(select(User).where(User.user_id == user_id))
        user = result.scalar_one_or_none()

        if user:
            first_name = extract_english_field(user.first_name)
            last_name = extract_english_field(user.last_name)
            full_name = f"{first_name} {last_name}".strip()
            role_val = (
                getattr(user.role, "value", user.role) if user.role else "Entrepreneur"
            )

            city = extract_english_field(user.city)
            district = extract_english_field(user.district)
            state = extract_english_field(user.state)
            country = extract_english_field(user.country)
            location_parts = [part for part in [city, district, state, country] if part]
            location_str = ", ".join(location_parts) if location_parts else "N/A"

            user_context = (
                f"\nAuthenticated User Profile Context:\n"
                f"- User ID: {user.user_id}\n"
                f"- Name: {full_name or 'Valued User'}\n"
                f"- Role: {role_val}\n"
                f"- Email: {user.email or 'N/A'}\n"
                f"- Phone: {user.phone_number or 'N/A'}\n"
                f"- Location: {location_str}\n"
                f"Address them by name if greeting, and consider their role ({role_val}) when answering."
            )

    # 2. Retrieve top-k chunks
    matched_chunks = retrieve_relevant_chunks(payload.message, top_k=3)

    # 3. Build RAG prompt context
    context_str = "\n\n---\n\n".join(
        [
            f"Chunk ID: {c.get('chunk_id')}\n"
            f"Title: {c.get('title')}\n"
            f"Page/Module: {c.get('page_module', 'N/A')}\n"
            f"Navigation Action: {c.get('navigation_action', 'N/A')}\n"
            f"Content:\n{c.get('content')}"
            for c in matched_chunks
        ]
    )

    dynamic_system_instruction = (
        f"{BASE_SITE_ASSISTANT_SYSTEM_INSTRUCTION}\n{user_context}"
    )

    prompt = f"""Retrieved Platform Context:
{context_str}

User Question: {payload.message}
Requested Language: {payload.language or "English"}

Provide a helpful, precise, and polite response following your system instructions. Include exact navigation steps when relevant."""

    # 4. Generate response using LangChain .invoke()
    messages = [
        SystemMessage(content=dynamic_system_instruction),
        HumanMessage(content=prompt),
    ]
    response = llm.invoke(messages)

    reply_text = (
        response.content
        if isinstance(response.content, str)
        else "".join([part.get("text", "") for part in response.content])
    )

    sources = [
        SourceChunk(
            chunk_id=c.get("chunk_id", ""),
            title=c.get("title", ""),
            page_module=c.get("page_module", ""),
            navigation_action=c.get("navigation_action", ""),
        )
        for c in matched_chunks
    ]

    return ChatResponse(reply=reply_text, sources=sources)
