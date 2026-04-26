"""TypedDict shapes for raw DORA events.

Mirrors `packages/shared-schemas/dora-event.schema.json` (GP-001) at the
type level. Two shapes:

  - DoraPipelineRunEvent: event_type='pipeline_run' (no commit_authored_at)
  - DoraDeploymentEvent : event_type='deployment'   (commit_authored_at REQUIRED;
                                                     is_rework + recovered_from_failure_id optional)

The full discriminated union is `DoraEvent`. Loader (load.py) validates
every event against the JSON Schema before downcasting; aggregators
(aggregate.py) consume the typed shapes for IDE autocomplete + mypy
strictness.

Wire-format compatibility: the schema's `additionalProperties: false`
guarantees no field outside the documented set lands in events. If the
schema gains a field, this file must be updated in the same PR (audit
trail discipline).
"""
from __future__ import annotations

from typing import Literal, NotRequired, TypedDict


# Common required fields on every event (SOC2 audit-trail invariant).
# Listed inline rather than via inheritance because TypedDict's inheritance
# sugar interacts oddly with NotRequired in some Python 3.11 minor versions.

class DoraPipelineRunEvent(TypedDict):
    event_id: str            # UUIDv7
    schema_version: Literal["1.0.0"]
    event_type: Literal["pipeline_run"]
    service: str
    repository: str          # owner/repo
    commit_sha: str
    actor: str
    work_id: str
    change_summary: str
    outcome: Literal["success", "failure", "cancelled"]
    started_at: str          # ISO8601 UTC
    finished_at: str         # ISO8601 UTC
    # Conditional (CI source):
    source: NotRequired[Literal["ci", "local", "manual"]]
    run_id: NotRequired[str]
    source_url: NotRequired[str]
    # Free-form:
    reason: NotRequired[str]
    labels: NotRequired[dict[str, str]]


class DoraDeploymentEvent(TypedDict):
    event_id: str
    schema_version: Literal["1.0.0"]
    event_type: Literal["deployment"]
    service: str
    repository: str
    commit_sha: str
    actor: str
    work_id: str
    change_summary: str
    outcome: Literal["success", "failure", "cancelled"]
    started_at: str
    finished_at: str
    # Required ON deployment events (GP-001 conditional):
    commit_authored_at: str
    # Conditional (CI source):
    source: NotRequired[Literal["ci", "local", "manual"]]
    run_id: NotRequired[str]
    source_url: NotRequired[str]
    # Rework correlation (MTTR join key):
    is_rework: NotRequired[bool]
    recovered_from_failure_id: NotRequired[str]
    # Free-form:
    environment: NotRequired[Literal["staging", "prod", "sandbox"]]
    reason: NotRequired[str]
    labels: NotRequired[dict[str, str]]


# Discriminated union for downstream consumers.
DoraEvent = DoraPipelineRunEvent | DoraDeploymentEvent
