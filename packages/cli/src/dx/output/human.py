"""Rich-formatted output for interactive humans."""

from __future__ import annotations

from typing import Any

from rich.console import Console
from rich.panel import Panel
from rich.text import Text

_stdout = Console()
_stderr = Console(stderr=True)


def emit_success(command: str, payload: dict[str, Any], *, duration_ms: int = 0) -> None:
    body = Text()
    if payload:
        for key, value in payload.items():
            body.append(f"{key}: ", style="bold")
            body.append(f"{value}\n")
    if duration_ms:
        body.append(f"\nduration: {duration_ms} ms", style="dim")
    panel = Panel(body, title=f"dx {command}", border_style="green")
    _stdout.print(panel)


def emit_error(command: str, message: str, fix_hint: str = "", *, duration_ms: int = 0) -> None:
    body = Text()
    body.append(f"{message}\n", style="red")
    if fix_hint:
        body.append("\nFix: ", style="bold yellow")
        body.append(f"{fix_hint}", style="yellow")
    panel = Panel(body, title=f"dx {command} (error)", border_style="red")
    _stderr.print(panel)
