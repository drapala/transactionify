"""Load + validate a JSONL file of raw DORA events against GP-001's schema.

Validation is fail-loud: any malformed line aborts loading with the line
number and the violating field. No partial summary is computed downstream.

Typing: events are validated against the GP-001 JSON Schema BEFORE being
cast to the typed shapes (DoraPipelineRunEvent / DoraDeploymentEvent).
The cast is structurally safe — schema validation guarantees every
required field is present and every value is in its enum set.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import cast

from jsonschema import Draft202012Validator

from dx.dora.event import DoraDeploymentEvent, DoraEvent, DoraPipelineRunEvent


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
    deployments: list[DoraDeploymentEvent]
    pipeline_runs: list[DoraPipelineRunEvent]
    by_event_id: dict[str, DoraEvent]
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

    deployments: list[DoraDeploymentEvent] = []
    pipeline_runs: list[DoraPipelineRunEvent] = []
    by_event_id: dict[str, DoraEvent] = {}
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
                event_raw = json.loads(line)
            except json.JSONDecodeError as e:
                raise ValueError(f"line {lineno}: invalid JSON ({e.msg})") from e

            errors = sorted(validator.iter_errors(event_raw), key=lambda e: list(e.path))
            if errors:
                first = errors[0]
                path = ".".join(str(p) for p in first.path) or "<root>"
                raise ValueError(
                    f"line {lineno}: schema validation failed at {path}: {first.message}"
                )

            kind = event_raw.get("event_type")
            # Schema validation above guarantees event_type is in the enum.
            # The cast is structurally safe; runtime guards on missing fields
            # are not required because additionalProperties:false + required
            # already enforced them.
            if kind == "deployment":
                deployment = cast(DoraDeploymentEvent, event_raw)
                deployments.append(deployment)
                by_event_id[deployment["event_id"]] = deployment
            elif kind == "pipeline_run":
                pipeline = cast(DoraPipelineRunEvent, event_raw)
                pipeline_runs.append(pipeline)
                by_event_id[pipeline["event_id"]] = pipeline
            # Unknown event types impossible after schema validation.

    return LoadedEvents(
        deployments=deployments,
        pipeline_runs=pipeline_runs,
        by_event_id=by_event_id,
        total_seen=total_seen,
    )
