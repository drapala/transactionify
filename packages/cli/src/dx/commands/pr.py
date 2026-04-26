"""`dx pr` — submit PR with Work-ID-conformant title; validates locally first.

Validation BEFORE any network call (Design Principle 1: Convention over
Configuration — easier to follow the rule than to break it). dx check
work_id runs against the current branch; if it fails, dx pr exits with
the same fix_hint the local check would emit.

The PR title regex is imported from CHECK_MANIFEST.work_id.subject_pattern
(single source of truth). The AST test enforces no inline duplicates.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Optional

import typer

from dx.checks.manifest import CHECK_MANIFEST
from dx.checks.work_id import check_work_id
from dx.clients import gh_api
from dx.errors import UserFacingError, WorkIdError
from dx.git_helpers import current_branch, latest_commit_subject, origin_url, parse_owner_repo
from dx.output import emit_error, emit_success, set_json_mode

# Sourced from CHECK_MANIFEST — see AST test.
_SUBJECT_RE = re.compile(CHECK_MANIFEST["work_id"]["subject_pattern"])
_EXTRACT_RE = re.compile(CHECK_MANIFEST["work_id"]["extract_pattern"])


def _resolve_title(branch: str | None, latest_subject: str | None, override: str | None) -> str:
    if override:
        # If user-supplied title lacks the `<work_id>: ` prefix, prepend it from
        # the branch's extracted work_id.
        if _SUBJECT_RE.match(override):
            return override
        if branch:
            m = _EXTRACT_RE.match(branch)
            if m:
                wid = m.group(0)
                return f"{wid}: {override}"
        return override  # caller will fail validation with an actionable message
    return latest_subject or ""


def _read_pr_body(cwd: Path) -> str:
    template = cwd / ".github" / "pull_request_template.md"
    if template.exists():
        return template.read_text()
    return ""


def pr_command(
    title: Optional[str] = typer.Option(None, "--title", help="Override PR title (will get work_id prefix if missing)."),
    base: str = typer.Option("main", "--base", help="Base branch."),
    dry_run: bool = typer.Option(False, "--dry-run", help="Validate + plan but do NOT call gh."),
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
) -> None:
    if json_output:
        set_json_mode(True)
    cwd = Path.cwd()

    # 1. Local validation BEFORE any network call.
    work_id_result = check_work_id(cwd=str(cwd))
    if work_id_result.status == "fail":
        err = WorkIdError(message=work_id_result.detail, fix_hint=work_id_result.fix_hint)
        if json_output:
            typer.echo(
                json.dumps({
                    "status": "error",
                    "validation": "failed",
                    "message": err.message,
                    "fix_hint": err.fix_hint,
                }),
                err=True,
            )
        else:
            emit_error("pr", err.message, err.fix_hint)
        raise typer.Exit(err.exit_code)

    branch = current_branch(cwd=str(cwd))
    latest = latest_commit_subject(cwd=str(cwd))
    pr_title = _resolve_title(branch, latest, title)
    if not _SUBJECT_RE.match(pr_title):
        err = WorkIdError(
            message=f"PR title '{pr_title}' does not match {_SUBJECT_RE.pattern}",
            fix_hint="set --title 'GP-NNN: <description>' or write a conformant commit subject.",
        )
        if json_output:
            typer.echo(
                json.dumps({"status": "error", "message": err.message, "fix_hint": err.fix_hint}),
                err=True,
            )
        else:
            emit_error("pr", err.message, err.fix_hint)
        raise typer.Exit(err.exit_code)

    work_id_match = _EXTRACT_RE.match(pr_title)
    work_id = work_id_match.group(0) if work_id_match else ""

    body = _read_pr_body(cwd)

    plan = {
        "title": pr_title,
        "body_path": ".github/pull_request_template.md",
        "base": base,
        "head": branch or "",
        "work_id": work_id,
        "validation": "passed",
    }

    if dry_run:
        if json_output:
            typer.echo(json.dumps(plan, separators=(",", ":")))
        else:
            emit_success("pr", {**plan, "status": "dry-run"})
        return

    # 2. Real PR creation via gh.
    try:
        result = gh_api.gh_pr_create(
            title=pr_title, body=body, base=base, head=branch or "HEAD", cwd=str(cwd),
        )
    except (gh_api.GhMissingError, RuntimeError) as e:
        err = UserFacingError(message=str(e), fix_hint="install gh and run `gh auth login`.")
        if json_output:
            typer.echo(json.dumps({"status": "error", "message": err.message, "fix_hint": err.fix_hint}), err=True)
        else:
            emit_error("pr", err.message, err.fix_hint)
        raise typer.Exit(1)

    summary = {
        "pr_number": result.number,
        "pr_url": result.url,
        "work_id": work_id,
        "title": pr_title,
    }
    if json_output:
        typer.echo(json.dumps(summary, separators=(",", ":")))
    else:
        emit_success("pr", summary)
