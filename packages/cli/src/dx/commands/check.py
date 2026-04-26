"""`dx check` — run checks defined in CHECK_MANIFEST.

Subcommands map 1:1 to manifest keys (lint, unit_tests, pbt, contract, work_id).
Calling `dx check` with no subcommand runs all of them in registry order.

Same code path used by CI (the framework's workflow generator reads commands
from the JSON copy emitted by manifest_codegen.py — Design Principle 2).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

import typer

from dx.checks.runner import CheckResult, overall_exit_code, run_checks
from dx.output import emit_error, emit_success, set_json_mode


CHECK_NAMES = ["lint", "unit_tests", "pbt", "contract", "work_id"]


def _emit(results: list[CheckResult], json_output: bool) -> None:
    failures = [r for r in results if r.status == "fail"]
    payload = {
        "results": [r.to_dict() for r in results],
        "failures": [
            {
                "check_name": r.name,
                "error_message": r.error_message,
                "suggested_fix": r.suggested_fix,
            }
            for r in failures
        ],
        "summary": {
            "total": len(results),
            "passed": sum(1 for r in results if r.status == "pass"),
            "failed": len(failures),
            "skipped": sum(1 for r in results if r.status == "skip"),
        },
    }
    if json_output:
        # Flat shape (NOT the {command, status, payload} envelope) so the
        # documented validation jq filter `.failures | length == 0` works.
        typer.echo(json.dumps(payload, separators=(",", ":")))
    else:
        for r in results:
            mark = {"pass": "✓", "fail": "✗", "skip": "·"}.get(r.status, "?")
            line = f"  {mark} {r.name} ({r.duration_ms} ms)"
            if r.status == "skip" and r.skip_reason:
                line += f" — {r.skip_reason}"
            typer.echo(line)
        if failures:
            typer.echo("")
            for r in failures:
                emit_error("check", f"{r.name} failed: {r.error_message[:400]}", r.suggested_fix)


def _run(name: Optional[str], json_output: bool, cwd: Path) -> int:
    if json_output:
        set_json_mode(True)
    targets = CHECK_NAMES if name is None else [name]
    results = run_checks(targets, cwd=cwd)
    _emit(results, json_output)
    return overall_exit_code(results)


# Top-level `dx check` (no subcommand) runs everything.
def check_root(
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
) -> None:
    code = _run(None, json_output, Path.cwd())
    if code != 0:
        raise typer.Exit(code)


def _make_subcommand(name: str):
    def _cmd(
        json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
    ) -> None:
        code = _run(name, json_output, Path.cwd())
        if code != 0:
            raise typer.Exit(code)

    _cmd.__name__ = f"check_{name}"
    _cmd.__doc__ = f"Run only the `{name}` check."
    return _cmd


def register(check_app: typer.Typer) -> None:
    """Wire root + per-check subcommands onto the check Typer."""
    check_app.callback(invoke_without_command=True)(_root_dispatcher)
    for name in CHECK_NAMES:
        check_app.command(name=name)(_make_subcommand(name))


def _root_dispatcher(
    ctx: typer.Context,
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
) -> None:
    if ctx.invoked_subcommand is not None:
        # The subcommand handler will run; honour --json if given at root level.
        if json_output:
            set_json_mode(True)
        return
    code = _run(None, json_output, Path.cwd())
    if code != 0:
        raise typer.Exit(code)
