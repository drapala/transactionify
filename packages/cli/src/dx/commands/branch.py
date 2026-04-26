"""`dx branch <work-id> "<title>"` — create a Work-ID-conformant branch.

The work_id pattern is imported from CHECK_MANIFEST (single source of
truth — same regex dx check / dx pr / GP-007's CI step use). The
test_workid_single_source.py AST test enforces no module re-inlines
the pattern.
"""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import typer

from dx.checks.manifest import CHECK_MANIFEST
from dx.errors import UserFacingError, WorkIdError
from dx.git_helpers import slugify
from dx.output import emit_error, emit_success, set_json_mode

# Regex sourced ONLY from CHECK_MANIFEST. Do NOT inline a pattern here —
# the AST test asserts no Constant string in this module matches a
# work_id-shaped literal.
_WORK_ID_RE = re.compile(CHECK_MANIFEST["work_id"]["extract_pattern"] + r"$")


def _build_branch_name(work_id: str, title: str) -> str:
    slug = slugify(title)
    return f"{work_id}-{slug}"


def _create_branch(branch_name: str, *, cwd: Path) -> None:
    proc = subprocess.run(
        ["git", "checkout", "-b", branch_name],
        cwd=str(cwd),
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise UserFacingError(
            message=f"git checkout -b failed: {proc.stderr.strip()}",
            fix_hint="ensure the working tree is clean and the branch name is not taken.",
            exit_code=proc.returncode or 1,
        )


def branch_command(
    work_id: str = typer.Argument(..., help="Work ID, e.g. GP-123"),
    title: str = typer.Argument(..., help="Short description, e.g. 'feat: add validator'"),
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
    base: str = typer.Option("main", "--base", help="Base branch to branch from."),
) -> None:
    if json_output:
        set_json_mode(True)

    if not _WORK_ID_RE.match(work_id):
        err = WorkIdError(
            message=f"work_id '{work_id}' does not match pattern {_WORK_ID_RE.pattern}",
            fix_hint="see .kiro/steering/golden-path.md §Conventions (work_id format).",
        )
        if json_output:
            typer.echo(
                json.dumps({"status": "error", "message": err.message, "fix_hint": err.fix_hint}),
                err=True,
            )
        else:
            emit_error("branch", err.message, err.fix_hint)
        raise typer.Exit(err.exit_code)

    branch_name = _build_branch_name(work_id, title)
    cwd = Path.cwd()
    try:
        _create_branch(branch_name, cwd=cwd)
    except UserFacingError as err:
        if json_output:
            typer.echo(
                json.dumps({"status": "error", "message": err.message, "fix_hint": err.fix_hint}),
                err=True,
            )
        else:
            emit_error("branch", err.message, err.fix_hint)
        raise typer.Exit(err.exit_code)

    summary = {
        "branch_name": branch_name,
        "work_id": work_id,
        "base": base,
        "status": "created",
    }
    if json_output:
        typer.echo(json.dumps(summary, separators=(",", ":")))
    else:
        emit_success("branch", summary)
