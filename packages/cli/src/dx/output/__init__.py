"""Output dispatch — single import surface for every dx command.

Every command imports `emit_success` and `emit_error` from here; the dispatch
between Rich (human) and JSON (machine) lives in `human.py` and `machine.py`.
Future commands inherit this dispatch by NOT reimplementing formatting.

The `--json` flag is read from a Typer global state object (`dx.cli.state`)
so individual command bodies stay format-agnostic.
"""

from __future__ import annotations

import sys
from typing import Any

from . import human, machine

_JSON_MODE = False


def set_json_mode(enabled: bool) -> None:
    global _JSON_MODE
    _JSON_MODE = enabled


def is_json_mode() -> bool:
    return _JSON_MODE


def emit_success(command: str, payload: dict[str, Any], *, duration_ms: int = 0) -> None:
    if _JSON_MODE:
        machine.emit_success(command, payload, duration_ms=duration_ms)
    else:
        human.emit_success(command, payload, duration_ms=duration_ms)


def emit_error(command: str, message: str, fix_hint: str = "", *, duration_ms: int = 0) -> None:
    if _JSON_MODE:
        machine.emit_error(command, message, fix_hint, duration_ms=duration_ms)
    else:
        human.emit_error(command, message, fix_hint, duration_ms=duration_ms)
    # exit code handled by caller (Typer)


def fatal(command: str, message: str, fix_hint: str = "", *, exit_code: int = 1) -> None:
    """Emit error and exit immediately."""
    emit_error(command, message, fix_hint)
    sys.exit(exit_code)


__all__ = ["emit_success", "emit_error", "fatal", "set_json_mode", "is_json_mode"]
