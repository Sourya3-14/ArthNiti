import os
from typing import Optional, Dict

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.config import GEMINI_MODEL_NAME
from src.config.database import get_db
from src.middlewares.auth import optional_verify_token
from src.schema.user import User
from src.services.knowledge_base_service import (
    search_similar_knowledge_chunks,
    sync_knowledge_base_pipeline,
)

# ---------------------------------------------------------
# Router & Configuration
# ---------------------------------------------------------
router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL_NAME,
    google_api_key=GEMINI_API_KEY,
    temperature=0.2,
)

# ---------------------------------------------------------
# Session History Storage
# (Note: In production, consider replacing the in-memory dict
# with RedisChatMessageHistory or PostgresChatMessageHistory)
# ---------------------------------------------------------
session_store: Dict[str, ChatMessageHistory] = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in session_store:
        session_store[session_id] = ChatMessageHistory()
    return session_store[session_id]


# ---------------------------------------------------------
# Prompt Pipeline Definition
# ---------------------------------------------------------
prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", "{system_instruction}"),
        MessagesPlaceholder(variable_name="history"),
        (
            "human",
            "Retrieved Platform Context:\n{context}\n\n"
            "User Question: {question}\n"
            "Requested Language: {language}\n\n"
            "Provide a helpful, precise, and polite response following your system instructions and strict role boundaries.",
        ),
    ]
)

# Runnable pipeline
rag_chain = prompt_template | llm

# Wrap with history tracking
runnable_with_history = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="history",
)


# ---------------------------------------------------------
# Helper to extract plain English string
# ---------------------------------------------------------
def extract_english_field(field_val) -> str:
    """Extracts the English value if field is a dict; otherwise returns string."""
    if isinstance(field_val, dict):
        return field_val.get("en") or next(iter(field_val.values()), "")
    return str(field_val or "")


# ---------------------------------------------------------
# Schemas & System Instruction
# ---------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"
    language: Optional[str] = "English"


class SourceChunk(BaseModel):
    chunk_id: str
    title: str
    page_module: Optional[str] = None
    navigation_action: Optional[str] = None
    redirection_link: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sources: list[SourceChunk]


class SyncResponse(BaseModel):
    message: str
    details: dict


BASE_SITE_ASSISTANT_SYSTEM_INSTRUCTION = """
You are the ArthNiti Site Assistant (Customer Onboarding & Platform Helper).
Greet visitors properly if they greet you and ask them for their queries.
Greet them only once per session. If they greet you again, acknowledge but do not repeat the greeting.
Your primary mission is to help visitors and registered users understand the platform, its features, workflows, and benefits.

STRICT ROLE-BASED OPERATIONAL GUARDRAILS:

1. GUEST / UNAUTHENTICATED USERS:
- The user is NOT authenticated. Explain platform capabilities, features, and business value.
- DO NOT provide internal navigation actions, UI button paths, or detailed site routing (e.g. do NOT say "click sidebar" or "go to /businesses/:id/edit").
- DO NOT push or spam the signup link in every message. Only provide a `/signup` or `/login` link if the user explicitly asks how to register, create an account, log in, or get started.

2. BUYER ROLE (COMMERCIAL / INSTITUTIONAL BUYERS):
- The user is an authenticated Buyer.
- Focus on marketplace sourcing, supplier discovery, connecting with rural micro-producers, and trade workflows.
- STRICT GATE: Buyers do NOT have access to granular internal business advisory, competitor margin blueprints, or micro-enterprise financial structuring. If a buyer inquires about internal business advisory or feasibility underwriting, politely inform them that detailed business advisory modules are exclusively reserved for registered entrepreneurs in their dedicated Business Workspace.

3. ENTREPRENEUR ROLE (REGISTERED ENTREPRENEURS & ADMINS):
- Full access to all platform features, hyper-local feasibility studies, demographic sizing, competitor density, mandi market pricing, supply chain sourcing, 3-year financial models, government scheme matching, and UI navigation steps.

4. GROUNDED ANSWERS ONLY:
- Answer strictly based on the provided retrieved platform context. If information is not in the context, politely state you do not know and advise reaching out via platform support.

5. MULTILINGUAL OUTPUT:
- Respect the user's selected language (e.g., English, Hindi, Bengali) while keeping technical URLs/routes intact (e.g., `/signup`, `/login`, `/businesses`).
"""


# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------
@router.post("/onboarding", response_model=ChatResponse)
async def chat_onboarding(
    payload: ChatRequest,
    user_id: Optional[str] = Depends(optional_verify_token),
    db: AsyncSession = Depends(get_db),
):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Determine User Role and Profile Context
    user_context = (
        "\nUser Profile Context: Guest (Not Authenticated).\n"
        "- Role: guest\n"
        "- Rules: Explain platform capabilities only. Do NOT provide navigation instructions. Do NOT provide a signup link unless the user explicitly asks how to sign up, register, or get started."
    )
    user_role = "guest"

    if user_id:
        result = await db.execute(select(User).where(User.user_id == user_id))
        user = result.scalar_one_or_none()

        if user:
            first_name = extract_english_field(user.first_name)
            last_name = extract_english_field(user.last_name)
            full_name = f"{first_name} {last_name}".strip()
            raw_role = (
                getattr(user.role, "value", user.role) if user.role else "enterpreneur"
            )
            user_role = str(raw_role).lower().strip()

            if "buy" in user_role:
                user_role = "buyer"
            elif "enterp" in user_role or "entre" in user_role:
                user_role = "enterpreneur"
            elif "admin" in user_role:
                user_role = "admin"
            else:
                user_role = "enterpreneur"

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
                f"- Role: {user_role}\n"
                f"- Email: {user.email or 'N/A'}\n"
                f"- Phone: {user.phone_number or 'N/A'}\n"
                f"- Location: {location_str}\n"
                f"Address them by name if greeting, and strictly enforce the operational guardrails for the {user_role} role."
            )

    # Resolve session_id (use user_id if authenticated, or request session_id)
    session_id = f"user_{user_id}" if user_id else f"guest_{payload.session_id}"

    # 2. Retrieve role-gated chunks from pgvector database
    matched_results = await search_similar_knowledge_chunks(
        db=db,
        query=payload.message,
        role=user_role,
        limit=3,
    )

    # 3. Build RAG prompt context based on role
    context_items = []
    for chunk, _similarity in matched_results:
        redir_info = (
            f"\nRedirection Link: {chunk.redirection_link}"
            if chunk.redirection_link
            else ""
        )
        if user_role == "guest":
            context_items.append(
                f"Feature Chunk ID: {chunk.chunk_id}\n"
                f"Title: {chunk.title}\n"
                f"Content:\n{chunk.content}"
                f"{redir_info}"
            )
        else:
            context_items.append(
                f"Chunk ID: {chunk.chunk_id}\n"
                f"Title: {chunk.title}\n"
                f"Page/Module: {chunk.page_module or 'N/A'}\n"
                f"Navigation Action: {chunk.navigation_action or 'N/A'}\n"
                f"Content:\n{chunk.content}"
                f"{redir_info}"
            )

    context_str = "\n\n---\n\n".join(context_items)
    dynamic_system_instruction = (
        f"{BASE_SITE_ASSISTANT_SYSTEM_INSTRUCTION}\n{user_context}"
    )

    # 4. Generate response using RunnableWithMessageHistory
    response = await runnable_with_history.ainvoke(
        {
            "system_instruction": dynamic_system_instruction,
            "context": context_str,
            "question": payload.message,
            "language": payload.language or "English",
        },
        config={"configurable": {"session_id": session_id}},
    )

    reply_text = (
        response.content
        if isinstance(response.content, str)
        else "".join([part.get("text", "") for part in response.content])
    )

    # 5. Format sources
    sources = [
        SourceChunk(
            chunk_id=chunk.chunk_id,
            title=chunk.title,
            page_module=chunk.page_module if not chunk.is_guest else None,
            navigation_action=chunk.navigation_action if not chunk.is_guest else None,
            redirection_link=chunk.redirection_link,
        )
        for chunk, _ in matched_results
    ]

    return ChatResponse(reply=reply_text, sources=sources)


@router.post("/sync-kb", response_model=SyncResponse)
async def sync_knowledge_base(
    force: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    Triggers synchronization from Supabase Object Storage (or local fallback).
    Checks document version against knowledge_base_doc_meta. If document version is unchanged,
    skips re-chunking and re-embedding. Pass force=True to force full re-chunking and re-embedding.
    """
    stats = await sync_knowledge_base_pipeline(db, force=force)
    return SyncResponse(
        message="Knowledge base synchronization completed successfully.",
        details=stats,
    )
