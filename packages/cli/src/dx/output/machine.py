"""JSON-formatted output for CI / scripts. Single line per emission."""

from __future__ import annotations

import json
import sys
from typing import Any


def emit_success(command: str, payload: dict[str, Any], *, duration_ms: int = 0) -> None:
    obj = {
        "command": command,
        "status": "ok",
        "duration_ms": duration_ms,
        "payload": payload,
    }
    sys.stdout.write(json.dumps(obj, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def emit_error(command: str, message: str, fix_hint: str = "", *, duration_ms: int = 0) -> None:
    obj = {
        "command": command,
        "status": "error",
        "duration_ms": duration_ms,
        "payload": {"message": message, "fix_hint": fix_hint},
    }
    # In --json mode, errors go to stdout (parseable) and stderr is suppressed.
    sys.stdout.write(json.dumps(obj, separators=(",", ":")) + "\n")
    sys.stdout.flush()
