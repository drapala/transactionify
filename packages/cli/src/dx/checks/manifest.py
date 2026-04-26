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
"""

from __future__ import annotations

CHECK_MANIFEST: dict[str, dict] = {
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
        "cmd": "schemathesis",
        "args": ["run", "openapi.yaml", "--checks=all"],
        "exit_codes_passing": [0],
    },
    "work_id": {
        "name": "work_id",
        # The same regex everywhere, three formats per context:
        #   extract_pattern  : raw id (`GP-123`)         — for parsing PR titles / commit subjects
        #   branch_pattern   : id + dash slug             — for branch names
        #   subject_pattern  : id + colon + description   — for commit subjects + PR titles
        "extract_pattern": r"(LL|GP)-[0-9]+",
        "branch_pattern": r"^(LL|GP)-[0-9]+-[a-z0-9-]+$",
        "subject_pattern": r"^(LL|GP)-[0-9]+: .+$",
    },
}
