"""CHECK_MANIFEST — single source of truth for check commands AND work_id patterns.

Consumers:
  - dx check          (Python, imports the dict directly)
  - dx branch         (Python, reads work_id.branch_pattern)
  - dx pr             (Python, reads work_id.subject_pattern)
  - framework gen     (TypeScript, imports the JSON emitted by
                       `python -m dx.checks.manifest_codegen`)

GP-007's cross-import test asserts the framework's workflow generator
reads commands from the JSON copy byte-for-byte (no hardcoded duplicates).
That test is the lock keeping local checks identical to CI checks
(Design Principle 2).

Typed via TypedDict for IDE autocomplete + mypy-friendly downstream
consumers (dx/dora/load.py + step builders in the TS framework).
The codegen script (manifest_codegen.py) emits the same shape as JSON;
the framework codegens a matching TS interface (no `(manifest as any)`).
"""

from __future__ import annotations

from typing import TypedDict


class CommandCheck(TypedDict):
    """Shape for command-driven checks (lint/unit_tests/pbt/contract)."""
    name: str
    cmd: str
    args: list[str]
    exit_codes_passing: list[int]


class WorkIdCheck(TypedDict):
    """Shape for the work_id pseudo-check (regex set, not a runnable command).

    Three patterns per context — all derived from the same Work ID alphabet:
      - extract_pattern: raw id (GP-123 or GP-009a) for parsing PR titles
      - branch_pattern : id + dash slug, for branch names
      - subject_pattern: id + colon + description, for commit subjects + PR titles
    """
    name: str
    extract_pattern: str
    branch_pattern: str
    subject_pattern: str


class CheckManifest(TypedDict):
    lint: CommandCheck
    unit_tests: CommandCheck
    pbt: CommandCheck
    contract: CommandCheck
    work_id: WorkIdCheck


CHECK_MANIFEST: CheckManifest = {
    "lint": {
        "name": "lint",
        "cmd": "ruff",
        "args": ["check", "."],
        "exit_codes_passing": [0],
    },
    "unit_tests": {
        "name": "unit_tests",
        "cmd": "pytest",
        "args": ["-x", "-q", "-m", "not pbt"],
        # 0 = success; 5 = no tests collected (treated as pass for fixture
        # repos that have no tests yet — better than gating on "must have
        # at least one test" before any code lands).
        "exit_codes_passing": [0, 5],
    },
    "pbt": {
        "name": "pbt",
        "cmd": "pytest",
        "args": ["-x", "-q", "-m", "pbt"],
        "exit_codes_passing": [0, 5],
    },
    "contract": {
        "name": "contract",
        # Validate the OpenAPI schema's structural correctness against the
        # OpenAPI 3.x spec. Static check — no live service needed —
        # appropriate for the PR pipeline.
        # Why not schemathesis: schemathesis v4+ requires --url even for
        # static schema work, and the PR pipeline has no reachable service.
        # A schemathesis run against the deployed sandbox is the natural
        # complement; documented as evolution path in the ADR
        # (requires sandbox-verify producing a reachable URL, ~0.5d wiring).
        "cmd": "openapi-spec-validator",
        "args": ["openapi.yaml"],
        "exit_codes_passing": [0],
    },
    "work_id": {
        "name": "work_id",
        # Trailing [a-z]? permits sub-task suffixes (GP-002b, GP-009a/c/d in
        # tasks.md). The platform's own spec chain uses them, so the canonical
        # regex must accept them — otherwise the platform fails to apply its
        # own conventions to its own commits.
        "extract_pattern": r"(LL|GP)-[0-9]+[a-z]?",
        "branch_pattern": r"^(LL|GP)-[0-9]+[a-z]?-[a-z0-9-]+$",
        "subject_pattern": r"^(LL|GP)-[0-9]+[a-z]?: .+$",
    },
}
