import os
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
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

# Initialize Chat Model with LangChain (.invoke ready)
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL_NAME,
    google_api_key=GEMINI_API_KEY,
    temperature=0.2,
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
            raw_role = getattr(user.role, "value", user.role) if user.role else "enterpreneur"
            user_role = str(raw_role).lower().strip()
            # Normalize role string (only buyer, enterpreneur, admin)
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
        redir_info = f"\nRedirection Link: {chunk.redirection_link}" if chunk.redirection_link else ""
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

    prompt = f"""Retrieved Platform Context:
{context_str}

User Question: {payload.message}
Requested Language: {payload.language or "English"}

Provide a helpful, precise, and polite response following your system instructions and strict role boundaries."""

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
    db: AsyncSession = Depends(get_db),
):
    """
    Triggers synchronization from Supabase Object Storage (or local fallback).
    Inserts and updates knowledge_base_chunks along with vector embeddings.
    """
    stats = await sync_knowledge_base_pipeline(db)
    return SyncResponse(
        message="Knowledge base synchronization completed successfully.",
        details=stats,
    )
