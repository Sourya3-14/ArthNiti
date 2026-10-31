from typing import Annotated, TypedDict, Optional, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class BusinessAgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    summary: str
    user_details: dict
    entrepreneur_details: dict
    vision_context: Optional[str]
    scratchpad: dict[str, Any]
