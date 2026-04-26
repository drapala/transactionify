"""Load + validate a JSONL file of raw DORA events against GP-001's schema.

Validation is fail-loud: any malformed line aborts loading with the line
number and the violating field. No partial summary is computed downstream.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError


def _repo_root_for(path: Path) -> Path:
    """Walk up to find the repo root (where packages/ lives)."""
    cur = path.resolve().parent
    for _ in range(10):
        if (cur / "packages" / "shared-schemas" / "dora-event.schema.json").exists():
            return cur
        if cur.parent == cur:
            break
        cur = cur.parent
    # Fallback: assume cwd is the repo root.
    return Path.cwd()


@dataclass
class LoadedEvents:
    deployments: list[dict]
    pipeline_runs: list[dict]
    by_event_id: dict[str, dict]
    total_seen: int

    @property
    def total_used(self) -> int:
        return len(self.deployments) + len(self.pipeline_runs)


def load_events(jsonl_path: Path, *, schema_path: Path | None = None) -> LoadedEvents:
    """Read the JSONL file and validate every event against GP-001 schema.

    Raises ValueError naming the offending line on validation failure.
    """
    if schema_path is None:
        schema_path = _repo_root_for(jsonl_path) / "packages" / "shared-schemas" / "dora-event.schema.json"
    if not schema_path.exists():
        raise FileNotFoundError(f"GP-001 schema not found at {schema_path}")

    schema = json.loads(schema_path.read_text())
    validator = Draft202012Validator(schema)

    deployments: list[dict] = []
    pipeline_runs: list[dict] = []
    by_event_id: dict[str, dict] = {}
    total_seen = 0

    if not jsonl_path.exists():
        raise FileNotFoundError(f"events file not found: {jsonl_path}")

    with jsonl_path.open() as fh:
        for lineno, raw in enumerate(fh, start=1):
            line = raw.strip()
            if not line:
                continue
            total_seen += 1
            try:
                event = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"line {lineno}: invalid JSON ({e.msg})") from e

            errors = sorted(validator.iter_errors(event), key=lambda e: list(e.path))
            if errors:
                first = errors[0]
                path = ".".join(str(p) for p in first.path) or "<root>"
                raise ValueError(
                    f"line {lineno}: schema validation failed at {path}: {first.message}"
                )

            kind = event.get("event_type")
            if kind == "deployment":
                deployments.append(event)
            elif kind == "pipeline_run":
                pipeline_runs.append(event)
            # Unknown event types are caught by schema validation above.

            eid = event.get("event_id")
            if eid:
                by_event_id[eid] = event

    return LoadedEvents(
        deployments=deployments,
        pipeline_runs=pipeline_runs,
        by_event_id=by_event_id,
        total_seen=total_seen,
    )
