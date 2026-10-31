from src.agents.agent_state import BusinessAgentState
from src.utils.agent_logger import get_session_logger


def initialize_scratchpad(state: BusinessAgentState):
    session_logger = get_session_logger()
    session_logger.log_state_transition(
        "initialize_scratchpad", "Checking or initializing task scratchpad"
    )

    if state.get("scratchpad"):
        tasks = state["scratchpad"].get("tasks", [])
        status = state["scratchpad"].get("overall_status", "in_progress")
        session_logger.log_state_completed(
            "initialize_scratchpad",
            summary=f"Active scratchpad preserved: {len(tasks)} tasks (Overall Status: {status})",
        )
        return {}

    session_logger.log_state_completed(
        "initialize_scratchpad",
        summary="Initialized fresh task scratchpad (Status: idle)",
    )
    return {
        "scratchpad": {
            "goal": None,
            "tasks": [],
            "findings": [],
            "overall_status": "idle",
        }
    }
