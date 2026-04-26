"""Execute checks from CHECK_MANIFEST and collect results.

Each check returns a CheckResult; the runner aggregates them and decides
the overall exit code. work_id has special branch/commit semantics so it
goes through check_work_id (not the generic command-runner).
"""
from __future__ import annotations

import shutil
import subprocess
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

from dx.checks.manifest import CHECK_MANIFEST
from dx.checks.work_id import check_work_id


@dataclass
class CheckResult:
    name: str
    status: str  # pass | fail | skip
    duration_ms: int
    cmd: Optional[list[str]] = None
    error_message: str = ""
    suggested_fix: str = ""
    skip_reason: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


def _run_command_check(name: str, *, cwd: Path) -> CheckResult:
    spec = CHECK_MANIFEST[name]
    cmd = spec["cmd"]
    args = list(spec["args"])
    passing = set(spec["exit_codes_passing"])

    if shutil.which(cmd) is None:
        return CheckResult(
            name=name,
            status="skip",
            duration_ms=0,
            skip_reason=f"`{cmd}` not on PATH; install it to run this check",
        )

    # contract requires openapi.yaml
    if name == "contract" and not (cwd / "openapi.yaml").exists():
        return CheckResult(
            name=name, status="skip", duration_ms=0,
            skip_reason="no openapi.yaml in cwd; contract check skipped",
        )

    start = time.monotonic()
    proc = subprocess.run([cmd, *args], cwd=str(cwd), capture_output=True, text=True)
    elapsed_ms = int((time.monotonic() - start) * 1000)
    if proc.returncode in passing:
        return CheckResult(name=name, status="pass", duration_ms=elapsed_ms, cmd=[cmd, *args])
    return CheckResult(
        name=name,
        status="fail",
        duration_ms=elapsed_ms,
        cmd=[cmd, *args],
        error_message=(proc.stdout + "\n" + proc.stderr).strip()[:2000],
        suggested_fix=_fix_hint_for(name),
    )


def _fix_hint_for(name: str) -> str:
    return {
        "lint": "run `ruff check . --fix` to auto-fix where possible.",
        "unit_tests": "fix the failing test(s); run pytest locally for the full traceback.",
        "pbt": "Hypothesis printed a counterexample — minimise it and patch the property.",
        "contract": "regenerate the OpenAPI fixtures or update openapi.yaml.",
    }.get(name, "")


def run_checks(checks: list[str], *, cwd: Path) -> list[CheckResult]:
    results: list[CheckResult] = []
    for name in checks:
        if name == "work_id":
            start = time.monotonic()
            r = check_work_id(cwd=str(cwd))
            elapsed = int((time.monotonic() - start) * 1000)
            results.append(
                CheckResult(
                    name="work_id",
                    status=r.status,
                    duration_ms=elapsed,
                    error_message=r.detail if r.status == "fail" else "",
                    suggested_fix=r.fix_hint,
                    skip_reason=r.detail if r.status == "skip" else "",
                ),
            )
        else:
            results.append(_run_command_check(name, cwd=cwd))
    return results


def overall_exit_code(results: list[CheckResult]) -> int:
    return 1 if any(r.status == "fail" for r in results) else 0
