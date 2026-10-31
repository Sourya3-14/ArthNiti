from src.agents.agent_state import BusinessAgentState


def initialize_scratchpad(state: BusinessAgentState):
    if state.get("scratchpad"):
        return {}

    return {
        "scratchpad": {
            "goal": None,
            "tasks": [],
            "findings": [],
            "overall_status": "idle",
        }
    }
