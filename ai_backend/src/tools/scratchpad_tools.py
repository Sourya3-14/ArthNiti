from typing import Literal
from copy import deepcopy

from langchain.tools import tool, ToolRuntime
from langchain_core.messages import ToolMessage
from langgraph.types import Command


@tool
def create_task_plan(
    goal: str,
    tasks: list[dict],
    runtime: ToolRuntime,
) -> Command:
    """Create a structured execution plan for a complex business request.

    Each task should contain:
    id, description, dependencies.
    """

    scratchpad = deepcopy(runtime.state.get("scratchpad") or {})

    if scratchpad.get("tasks"):
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content="An existing task plan is already active. Continue that plan instead of replacing it.",
                        tool_call_id=runtime.tool_call_id,
                    )
                ]
            }
        )

    normalized_tasks = []

    for task in tasks:
        normalized_tasks.append(
            {
                "id": str(task["id"]),
                "description": task["description"],
                "dependencies": [str(dep) for dep in task.get("dependencies", [])],
                "status": "pending",
                "result": None,
            }
        )

    scratchpad.update(
        {
            "goal": goal,
            "tasks": normalized_tasks,
            "overall_status": "in_progress",
        }
    )

    return Command(
        update={
            "scratchpad": scratchpad,
            "messages": [
                ToolMessage(
                    content=f"Task plan created with {len(normalized_tasks)} tasks.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


@tool
def update_task_progress(
    task_id: str,
    status: Literal["in_progress", "completed", "failed", "pending"],
    result: str,
    runtime: ToolRuntime,
) -> Command:
    """Update the status and intermediate result of an existing task."""

    scratchpad = deepcopy(runtime.state.get("scratchpad") or {})
    tasks = scratchpad.get("tasks", [])

    task = next(
        (item for item in tasks if item["id"] == str(task_id)),
        None,
    )

    if task is None:
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=f"Task {task_id} was not found.",
                        tool_call_id=runtime.tool_call_id,
                    )
                ]
            }
        )

    if status == "in_progress":
        incomplete_dependencies = [
            dep
            for dep in task["dependencies"]
            if not any(
                item["id"] == dep and item["status"] == "completed" for item in tasks
            )
        ]

        if incomplete_dependencies:
            return Command(
                update={
                    "messages": [
                        ToolMessage(
                            content=f"Cannot start this task. Dependencies not completed: {incomplete_dependencies}",
                            tool_call_id=runtime.tool_call_id,
                        )
                    ]
                }
            )

    task["status"] = status
    task["result"] = result

    if all(item["status"] == "completed" for item in tasks):
        scratchpad["overall_status"] = "completed"
    elif any(item["status"] == "failed" for item in tasks):
        scratchpad["overall_status"] = "needs_attention"
    else:
        scratchpad["overall_status"] = "in_progress"

    return Command(
        update={
            "scratchpad": scratchpad,
            "messages": [
                ToolMessage(
                    content=f"Task {task_id} updated to {status}.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )
