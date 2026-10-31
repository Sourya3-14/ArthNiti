import asyncio
import logging
import mimetypes
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.agents.business_agent import get_business_agent
from src.agents.vision_node import analyze_user_image
from src.config.database import get_db
import src.config.langgraph as langgraph_config
from src.middlewares.role import require_enterpreneur
from src.schema.enterpreneur import Enterpreneur
from src.schema.chat import ChatSession, ChatMessage, ChatMessageTranslation
from src.utils.translator_utils import Translator
from src.services.chat_summary_service import update_session_summary_background
from src.utils.agent_logger import (
    get_session_logger,
    set_current_session_id,
    AgentSessionCallbackHandler,
    is_agent_logging_enabled,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    business_id: str
    message: str
    session_id: Optional[str] = None
    language: str = "en"
    image_url: Optional[str] = None
    supabase_url: Optional[str] = None
    image_base64: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    image_url: Optional[str] = None


def _guess_mime_type(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    clean_url = url.split("?")[0]
    mime_type, _ = mimetypes.guess_type(clean_url)
    return mime_type


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    entrepreneur: Enterpreneur = Depends(require_enterpreneur),
    db: AsyncSession = Depends(get_db),
):
    try:
        translator = Translator()
        is_foreign_lang = request.language.strip().lower() not in ["en", "english"]

        # Resolve image location and MIME type
        resolved_image_url = request.supabase_url or request.image_url
        resolved_mime_type = _guess_mime_type(resolved_image_url)

        # 1. Translate incoming user message to English if necessary (Non-blocking)
        english_user_message = request.message
        if is_foreign_lang:
            english_user_message = await asyncio.to_thread(
                translator.translate,
                text=request.message,
                source_language=request.language,
                target_language="en",
            )

        # 2. Resolve or Create Chat Session (Verifying ownership)
        if request.session_id:
            stmt = select(ChatSession).where(
                ChatSession.id == request.session_id,
                ChatSession.user_id == entrepreneur.user_id,
            )
            result = await db.execute(stmt)
            session = result.scalar_one_or_none()
            if not session:
                raise HTTPException(
                    status_code=404, detail="Chat session not found or unauthorized"
                )
            session_id = session.id
        else:
            new_session = ChatSession(
                user_id=entrepreneur.user_id, business_id=request.business_id
            )
            db.add(new_session)
            await db.flush()
            session_id = new_session.id

        set_current_session_id(session_id)
        session_logger = get_session_logger(session_id)
        session_logger.log_session_start(
            business_id=request.business_id,
            user_id=entrepreneur.user_id,
            message=request.message,
            language=request.language,
            has_image=bool(request.image_base64 or resolved_image_url),
        )

        # 3. Persist original ENGLISH user message in DB
        user_message_record = ChatMessage(
            session_id=session_id,
            role="user",
            content=english_user_message,
            image_url=resolved_image_url,
            image_mime_type=resolved_mime_type,
        )
        db.add(user_message_record)
        await db.flush()

        # Only store translation if language is not English
        if is_foreign_lang:
            user_translation = ChatMessageTranslation(
                message_id=user_message_record.id,
                language=request.language,
                content=request.message,
                image_url=resolved_image_url,
                image_mime_type=resolved_mime_type,
            )
            db.add(user_translation)

        await db.commit()

        # 4. If an image is provided, analyze it immediately before invoking the agent
        image_source = request.image_base64 or resolved_image_url
        vision_info = ""
        if image_source:
            logger.info("Image detected for chat. Running visual analysis...")
            session_logger.log_state_transition("vision_node", "Extracting visual insights from attached image")
            vision_info = await analyze_user_image(
                image_source=image_source,
                user_text=english_user_message,
            )
            session_logger.log_state_completed(
                "vision_node",
                summary=f"Visual extraction complete ({len(vision_info)} chars)"
            )

        # Prepend visual analysis directly to the text given to the agent
        if vision_info:
            agent_input_message = (
                f"[SYSTEM VISUAL OBSERVATION FROM ATTACHED IMAGE]:\n{vision_info}\n\n"
                f"User: {english_user_message}"
            )
        else:
            agent_input_message = english_user_message

        # 5. Initialize Agent
        workflow, user_details, entrepreneur_details = await get_business_agent(
            db=db,
            business_id=request.business_id,
            user_id=entrepreneur.user_id,
        )

        if langgraph_config.checkpointer is None:
            raise RuntimeError("LangGraph checkpointer is not initialized")

        agent = workflow.compile(checkpointer=langgraph_config.checkpointer)

        callbacks = []
        if is_agent_logging_enabled():
            callbacks.append(AgentSessionCallbackHandler(session_id=session_id))

        config = {
            "configurable": {"thread_id": session_id},
            "callbacks": callbacks,
        }

        # 6. Execute Agent (Vision info is safely preserved in messages & checkpointer)
        session_logger.log_state_transition(
            "langgraph_workflow",
            "Executing state graph pipeline (initialize_scratchpad -> agent -> memory_manager)"
        )
        result = await agent.ainvoke(
            {
                "messages": [("user", agent_input_message)],
                "user_details": user_details,
                "entrepreneur_details": entrepreneur_details,
            },
            config=config,
        )
        session_logger.log_state_completed(
            "langgraph_workflow",
            "State graph pipeline finished execution"
        )

        raw_content = result["messages"][-1].content

        if isinstance(raw_content, list):
            english_agent_response = "".join(
                block.get("text", "")
                for block in raw_content
                if isinstance(block, dict)
            )
        else:
            english_agent_response = str(raw_content)

        # 7. Persist the generated agent response in English
        agent_message_record = ChatMessage(
            session_id=session_id,
            role="agent",
            content=english_agent_response,
            image_url=None,
            image_mime_type=None,
        )
        db.add(agent_message_record)
        await db.flush()

        # 8. Translate the response back (Non-blocking) and persist only if non-English
        final_response = english_agent_response
        if is_foreign_lang:
            final_response = await asyncio.to_thread(
                translator.translate,
                text=english_agent_response,
                source_language="en",
                target_language=request.language,
            )

            agent_translation = ChatMessageTranslation(
                message_id=agent_message_record.id,
                language=request.language,
                content=final_response,
                image_url=None,
                image_mime_type=None,
            )
            db.add(agent_translation)

        await db.commit()

        # 9. Trigger background summarization without blocking user response
        background_tasks.add_task(update_session_summary_background, session_id)

        session_logger.log_session_complete(final_response)

        return ChatResponse(
            response=final_response,
            session_id=session_id,
            image_url=resolved_image_url,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("Error during chat_with_agent execution: %s", str(e))
        if "session_logger" in locals():
            session_logger.log_error("chat_with_agent", e)
        raise HTTPException(status_code=500, detail=str(e))
     