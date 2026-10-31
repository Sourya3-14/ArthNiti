import os
import time
import logging
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, Any
from copy import deepcopy
from contextvars import ContextVar

from langchain_core.callbacks.base import BaseCallbackHandler
from langchain_core.outputs import LLMResult

from src.config.config import BASE_DIR

# Dedicated directory for per-session log files
LOGS_DIR = BASE_DIR / "logs" / "sessions"

console_logger = logging.getLogger("arthniti.agent")

_current_session_id_var: ContextVar[str] = ContextVar("current_session_id", default="")


def set_current_session_id(session_id: str):
    """Stores the current session ID in async context."""
    _current_session_id_var.set(session_id)


def get_current_session_id() -> str:
    """Retrieves the current session ID from async context."""
    return _current_session_id_var.get()


def is_agent_logging_enabled() -> bool:
    """Returns True if AGENT_LOGGING is explicitly set to true in environment."""
    return os.getenv("AGENT_LOGGING", "").strip().lower() in ("true", "1", "yes")


class AgentSessionLogger:
    """Session-specific logger that records the AI agent's state, thought process,

    tool invocations, scratchpad tasks, and completed deliverables to both
    a dedicated session log file and the console output.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id or "unknown_session"
        self.short_id = self.session_id[:8] if len(self.session_id) >= 8 else self.session_id
        self.enabled = is_agent_logging_enabled()
        self.start_time: Optional[float] = None
        self._tool_start_times: dict[str, float] = {}
        self._llm_start_time: Optional[float] = None

        self._log_file_path: Optional[Path] = None
        if self.enabled:
            LOGS_DIR.mkdir(parents=True, exist_ok=True)
            self._log_file_path = LOGS_DIR / f"{self.session_id}.log"

    def _write_file(self, message: str):
        """Append a timestamped message to the session's individual log file."""
        if not self.enabled or not self._log_file_path:
            return

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        try:
            with open(self._log_file_path, "a", encoding="utf-8") as f:
                f.write(f"[{timestamp}] {message}\n")
        except Exception as e:
            console_logger.error(f"Failed to write to agent session log file: {e}")

    def _format_data(self, data: Any, max_len: int = 1500) -> str:
        """Pretty-format dictionaries, strings or objects for log output."""
        if data is None:
            return ""
        if isinstance(data, (dict, list)):
            try:
                formatted = json.dumps(data, indent=2, ensure_ascii=False)
            except Exception:
                formatted = str(data)
        else:
            formatted = str(data)

        if len(formatted) > max_len:
            return formatted[:max_len] + f"... [truncated {len(formatted) - max_len} chars]"
        return formatted

    # -------------------------------------------------------------------------
    # High-Level Session Lifecycle Logging
    # -------------------------------------------------------------------------

    def log_session_start(
        self,
        business_id: str,
        user_id: str,
        message: str,
        language: str = "en",
        has_image: bool = False,
    ):
        if not self.enabled:
            return

        self.start_time = time.time()
        banner = (
            "\n"
            + "=" * 80 + "\n"
            + f"🚀 [AGENT SESSION START] Session ID: {self.session_id}\n"
            + f"   • Business ID: {business_id}\n"
            + f"   • User ID:     {user_id}\n"
            + f"   • Language:    {language}\n"
            + f"   • Has Image:   {'Yes' if has_image else 'No'}\n"
            + f"   • User Input:  \"{message}\"\n"
            + "=" * 80
        )
        self._write_file(banner)
        console_logger.info(
            f"[AGENT][Session:{self.short_id}] 🚀 Started processing turn | Input: \"{message[:100]}\""
        )

    def log_state_transition(
        self,
        node_name: str,
        description: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        """Logged when moving into a LangGraph node or pipeline stage."""
        if not self.enabled:
            return

        msg = f"🔄 [STATE TRANSITION] Entering Node: '{node_name}'"
        if description:
            msg += f" — {description}"
        if details:
            msg += f"\n   Details: {self._format_data(details)}"

        self._write_file(msg)
        console_logger.info(f"[AGENT][Session:{self.short_id}] 🔄 State -> '{node_name}'")

    def log_state_completed(
        self,
        node_name: str,
        summary: Optional[str] = None,
        duration_sec: Optional[float] = None,
    ):
        """Logged when a LangGraph node finishes execution."""
        if not self.enabled:
            return

        msg = f"✅ [STATE COMPLETED] Node: '{node_name}'"
        if duration_sec is not None:
            msg += f" (took {duration_sec:.2f}s)"
        if summary:
            msg += f" | {summary}"

        self._write_file(msg)
        console_logger.info(f"[AGENT][Session:{self.short_id}] ✅ Completed Node: '{node_name}'")

    # -------------------------------------------------------------------------
    # LLM & Reasoning Logging
    # -------------------------------------------------------------------------

    def log_llm_start(self, prompt_summary: Optional[str] = None):
        if not self.enabled:
            return

        self._llm_start_time = time.time()
        msg = "🧠 [LLM REASONING] LLM call initiated (analyzing prompt, deciding actions)..."
        if prompt_summary:
            msg += f"\n   Context: {prompt_summary}"
        self._write_file(msg)
        console_logger.info(f"[AGENT][Session:{self.short_id}] 🧠 LLM reasoning started...")

    def log_llm_end(
        self,
        response_text: Optional[str] = None,
        tool_calls: Optional[list] = None,
    ):
        if not self.enabled:
            return

        duration = (
            time.time() - self._llm_start_time if self._llm_start_time else 0.0
        )
        msg = f"💭 [LLM RESPONSE] Completed in {duration:.2f}s"
        if tool_calls and len(tool_calls) > 0:
            call_names = [
                tc.get("name") if isinstance(tc, dict) else getattr(tc, "name", str(tc))
                for tc in tool_calls
            ]
            msg += f"\n   Decision: LLM decided to invoke {len(tool_calls)} tool(s): {call_names}"
            console_logger.info(
                f"[AGENT][Session:{self.short_id}] 💭 LLM decided to invoke: {', '.join(call_names)}"
            )
        else:
            msg += f"\n   Decision: LLM generated final conversational answer ({len(response_text or '')} chars)"
            console_logger.info(
                f"[AGENT][Session:{self.short_id}] 💭 LLM generated direct response."
            )

        if response_text:
            msg += f"\n   Generated Text Preview:\n   {self._format_data(response_text, max_len=600)}"

        self._write_file(msg)

    # -------------------------------------------------------------------------
    # Tool Execution Logging
    # -------------------------------------------------------------------------

    def log_tool_start(self, tool_name: str, tool_args: Any):
        if not self.enabled:
            return

        self._tool_start_times[tool_name] = time.time()
        msg = (
            f"🛠️  [TOOL INVOKED] Running '{tool_name}'\n"
            f"   Arguments: {self._format_data(tool_args)}"
        )
        self._write_file(msg)
        console_logger.info(
            f"[AGENT][Session:{self.short_id}] 🛠️  Tool '{tool_name}' started..."
        )

    def log_tool_end(
        self,
        tool_name: str,
        output: Any,
        success: bool = True,
        error_msg: Optional[str] = None,
    ):
        if not self.enabled:
            return

        start = self._tool_start_times.pop(tool_name, None)
        duration = time.time() - start if start else 0.0

        if success:
            msg = (
                f"✨ [TOOL COMPLETED] '{tool_name}' succeeded in {duration:.2f}s\n"
                f"   Output Result: {self._format_data(output)}"
            )
            self._write_file(msg)
            console_logger.info(
                f"[AGENT][Session:{self.short_id}] ✨ Tool '{tool_name}' finished ({duration:.2f}s)"
            )
        else:
            msg = (
                f"❌ [TOOL FAILED] '{tool_name}' failed after {duration:.2f}s\n"
                f"   Error: {error_msg or output}"
            )
            self._write_file(msg)
            console_logger.error(
                f"[AGENT][Session:{self.short_id}] ❌ Tool '{tool_name}' failed: {error_msg or output}"
            )

    # -------------------------------------------------------------------------
    # Scratchpad & Task Planning Logging
    # -------------------------------------------------------------------------

    def log_task_plan(self, goal: str, tasks: list[dict]):
        if not self.enabled:
            return

        msg = (
            f"📋 [SCRATCHPAD: PLAN CREATED] Goal: \"{goal}\"\n"
            f"   Total Sub-Tasks: {len(tasks)}"
        )
        for i, t in enumerate(tasks, 1):
            task_id = t.get("id", i)
            desc = t.get("description", "")
            deps = t.get("dependencies", [])
            status = t.get("status", "pending")
            msg += f"\n   • Task {task_id} [{status.upper()}]: {desc} (depends on: {deps or 'None'})"

        self._write_file(msg)
        console_logger.info(
            f"[AGENT][Session:{self.short_id}] 📋 Task plan established ({len(tasks)} sub-tasks) for goal: \"{goal[:60]}\""
        )

    def log_task_update(
        self,
        task_id: str,
        status: str,
        result: Optional[str] = None,
    ):
        if not self.enabled:
            return

        status_emoji = {
            "in_progress": "⏳",
            "completed": "🎯",
            "failed": "⚠️",
            "pending": "⏸️",
        }.get(status, "🔹")

        msg = f"{status_emoji} [SCRATCHPAD: TASK UPDATE] Task '{task_id}' -> status: {status.upper()}"
        if result:
            msg += f"\n   Result: {self._format_data(result, max_len=800)}"

        self._write_file(msg)
        console_logger.info(
            f"[AGENT][Session:{self.short_id}] {status_emoji} Task '{task_id}' is now {status.upper()}"
        )

    # -------------------------------------------------------------------------
    # Memory & Conversation Summary Logging
    # -------------------------------------------------------------------------

    def log_memory_update(self, summary_preview: str):
        if not self.enabled:
            return

        msg = (
            f"💾 [MEMORY UPDATED] Rolling session summary updated:\n"
            f"   {self._format_data(summary_preview, max_len=600)}"
        )
        self._write_file(msg)
        console_logger.info(
            f"[AGENT][Session:{self.short_id}] 💾 Memory summary updated."
        )

    # -------------------------------------------------------------------------
    # Session Completion / Error
    # -------------------------------------------------------------------------

    def log_session_complete(self, final_response: str):
        if not self.enabled:
            return

        duration = time.time() - self.start_time if self.start_time else 0.0
        banner = (
            "\n"
            + "-" * 80 + "\n"
            + f"🏁 [AGENT SESSION COMPLETED] Session ID: {self.session_id}\n"
            + f"   • Total Turn Execution Time: {duration:.2f}s\n"
            + f"   • Final Agent Response ({len(final_response)} chars):\n"
            + f"     {final_response[:600]}...\n"
            + "=" * 80 + "\n"
        )
        self._write_file(banner)
        console_logger.info(
            f"[AGENT][Session:{self.short_id}] 🏁 Turn completed successfully in {duration:.2f}s"
        )

    def log_error(self, stage: str, error: Exception):
        if not self.enabled:
            return

        duration = time.time() - self.start_time if self.start_time else 0.0
        msg = (
            f"💥 [AGENT ERROR] Failed during '{stage}' after {duration:.2f}s\n"
            f"   Exception: {str(error)}"
        )
        self._write_file(msg)
        console_logger.error(
            f"[AGENT][Session:{self.short_id}] 💥 Error during '{stage}': {error}"
        )


# Global registry of active session loggers
_session_loggers: dict[str, AgentSessionLogger] = {}


def get_session_logger(session_id: Optional[str] = None) -> AgentSessionLogger:
    """Retrieve or create an AgentSessionLogger for a given chat session ID.
    If session_id is omitted, falls back to the current context variable.
    """
    resolved_id = session_id or get_current_session_id() or "unknown_session"
    if resolved_id not in _session_loggers:
        _session_loggers[resolved_id] = AgentSessionLogger(resolved_id)
    return _session_loggers[resolved_id]


# -----------------------------------------------------------------------------
# LangChain Callback Handler for real-time tool and LLM tracing
# -----------------------------------------------------------------------------

class AgentSessionCallbackHandler(BaseCallbackHandler):
    """LangChain callback handler that feeds LLM and Tool lifecycle events

    directly into the session-specific AgentSessionLogger.
    """

    def __init__(self, session_id: str):
        super().__init__()
        self.session_logger = get_session_logger(session_id)

    def on_llm_start(
        self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any
    ) -> None:
        first_prompt = prompts[0] if prompts else ""
        preview = first_prompt[-300:] if len(first_prompt) > 300 else first_prompt
        self.session_logger.log_llm_start(prompt_summary=preview)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        try:
            generations = response.generations
            if not generations or not generations[0]:
                self.session_logger.log_llm_end()
                return

            gen = generations[0][0]
            text = getattr(gen, "text", "")
            message = getattr(gen, "message", None)
            tool_calls = []

            if message:
                tool_calls = getattr(message, "tool_calls", []) or []
                if not text:
                    text = getattr(message, "content", "")

            self.session_logger.log_llm_end(response_text=text, tool_calls=tool_calls)
        except Exception:
            self.session_logger.log_llm_end()

    def on_llm_error(self, error: BaseException, **kwargs: Any) -> None:
        self.session_logger.log_error("LLM Generation", error)

    def on_tool_start(
        self, serialized: dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        tool_name = serialized.get("name") or serialized.get("id") or "UnknownTool"
        self.session_logger.log_tool_start(tool_name, input_str)

    def on_tool_end(self, output: Any, **kwargs: Any) -> None:
        tool_name = kwargs.get("name") or "Tool"
        self.session_logger.log_tool_end(tool_name, output, success=True)

    def on_tool_error(self, error: BaseException, **kwargs: Any) -> None:
        tool_name = kwargs.get("name") or "Tool"
        self.session_logger.log_tool_end(
            tool_name, output=str(error), success=False, error_msg=str(error)
        )

    def on_chain_start(
        self, serialized: dict[str, Any], inputs: dict[str, Any], **kwargs: Any
    ) -> None:
        name = serialized.get("name") or kwargs.get("name") or ""
        if name in ("agent", "initialize_scratchpad", "memory_manager"):
            self.session_logger.log_state_transition(name, "Node execution started")

    def on_chain_end(self, outputs: dict[str, Any], **kwargs: Any) -> None:
        name = kwargs.get("name") or ""
        if name in ("agent", "initialize_scratchpad", "memory_manager"):
            self.session_logger.log_state_completed(name, "Node execution completed")

    def on_chain_error(self, error: BaseException, **kwargs: Any) -> None:
        name = kwargs.get("name") or "Chain"
        self.session_logger.log_error(f"Chain '{name}'", error)
