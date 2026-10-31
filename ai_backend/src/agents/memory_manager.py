from langchain_core.messages import RemoveMessage, SystemMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from src.agents.agent_state import BusinessAgentState

from src.config.config import GEMINI_MODEL_NAME

from src.utils.agent_logger import get_session_logger

# Use the absolute cheapest model for background summarization
summary_llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL_NAME, temperature=0.1)


async def summarize_and_trim_memory(state: BusinessAgentState):
    session_logger = get_session_logger()
    session_logger.log_state_transition(
        "memory_manager", "Summarizing and trimming long conversation memory"
    )

    messages = state["messages"]
    summary = state.get("summary", "")
    vision_context = state.get("vision_context", "")

    # Extract the messages we are about to trim (keep the most recent 6)
    messages_to_summarize = messages

    summary_prompt = (
        f"Here is the current summary of the conversation:\n{summary}\n\n"
        "Here are the new messages:\n"
        f"{[msg.content for msg in messages_to_summarize]}\n\n"
        f"Visual information from the latest uploaded image:\n"
        f"{vision_context}\n\n"
        "Update the summary to include the new information. Keep it concise."
        "Try to keep names, key details inside the summary always properly."
        "Summarization should never loose key details."
    )

    response = await summary_llm.ainvoke([HumanMessage(content=summary_prompt)])
    new_summary = response.content

    session_logger.log_memory_update(summary_preview=str(new_summary))
    session_logger.log_state_completed(
        "memory_manager",
        summary=f"Memory summary updated ({len(str(new_summary))} chars)"
    )

    return {"summary": new_summary}
