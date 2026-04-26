"""`dx governance apply` — apply the platform GitHub ruleset to the target repo.

Mirrors packages/framework/src/governance/{defaults,rulesets}.ts:
  - extractBlockingJobsFromWorkflow: parse generated PR workflow, return the
    job names that must pass before merge (excludes continue-on-error and
    if: always() jobs).
  - buildDefaultRuleset: build the GitHub Rulesets API request body with
    derived required_status_checks. NO required_signatures by default
    (P0-7 — would block the demo merge without GPG/SSH preconfigured).

Idempotent apply: list existing rulesets → match by name → POST (create)
or PUT (update by numeric id; the API addresses rulesets by id, NOT name).
"""
from __future__ import annotations

import json as _json
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import typer
import yaml

from dx.errors import UserFacingError
from dx.output import emit_error, set_json_mode

# ----- ruleset construction (mirrors framework/src/governance) ---------------


def extract_blocking_jobs(workflow_path: Path) -> list[str]:
    parsed = yaml.safe_load(workflow_path.read_text())
    if not parsed or "jobs" not in parsed:
        return []
    out = []
    for name, job in parsed["jobs"].items():
        if not isinstance(job, dict):
            continue
        if job.get("continue-on-error") is True:
            continue
        if isinstance(job.get("if"), str) and job["if"].strip() == "always()":
            continue
        out.append(name)
    return out


def build_default_ruleset(
    *,
    required_checks: list[str],
    name: str = "golden-path-default",
    branches: Optional[list[str]] = None,
    required_approvers: int = 2,
    signed_commits: bool = False,
) -> dict:
    if not required_checks:
        raise UserFacingError(
            message="buildDefaultRuleset: requiredChecks must contain at least one context.",
            fix_hint="Pass extract_blocking_jobs(...). Hardcoding the list is a documented anti-pattern.",
            exit_code=2,
        )
    branches = branches or ["refs/heads/main"]
    rules: list[dict] = [
        {
            "type": "pull_request",
            "parameters": {
                "required_approving_review_count": required_approvers,
                "dismiss_stale_reviews_on_push": True,
                "require_code_owner_review": True,
                "require_last_push_approval": False,
                "required_review_thread_resolution": True,
            },
        },
        {
            "type": "required_status_checks",
            "parameters": {
                "required_status_checks": [{"context": c} for c in required_checks],
                "strict_required_status_checks_policy": True,
            },
        },
        {"type": "deletion"},
        {"type": "non_fast_forward"},
    ]
    if signed_commits:
        rules.append({"type": "required_signatures"})
    return {
        "name": name,
        "target": "branch",
        "enforcement": "active",
        "conditions": {"ref_name": {"include": branches, "exclude": []}},
        "rules": rules,
    }


# ----- gh api wrappers --------------------------------------------------------


@dataclass
class GhResult:
    ok: bool
    stdout: str
    stderr: str


def _gh_available() -> bool:
    return shutil.which("gh") is not None


def _gh_api(method: str, path: str, *, body: dict | None = None) -> GhResult:
    args = ["gh", "api", "--method", method, path]
    if body is not None:
        args += ["--input", "-"]
    proc = subprocess.run(
        args,
        input=_json.dumps(body) if body is not None else None,
        capture_output=True,
        text=True,
    )
    return GhResult(ok=proc.returncode == 0, stdout=proc.stdout, stderr=proc.stderr)


def list_rulesets(owner: str, repo: str) -> list[dict]:
    r = _gh_api("GET", f"/repos/{owner}/{repo}/rulesets")
    if not r.ok:
        raise UserFacingError(
            message=f"gh api list rulesets failed: {r.stderr.strip()}",
            fix_hint="run `gh auth status` and ensure your token has admin scope.",
        )
    try:
        return _json.loads(r.stdout) if r.stdout.strip() else []
    except _json.JSONDecodeError:
        return []


# ----- command ----------------------------------------------------------------


def _resolve_repo(repo_flag: Optional[str], cwd: Path) -> tuple[str, str]:
    if repo_flag and "/" in repo_flag:
        owner, name = repo_flag.split("/", 1)
        return owner, name
    # Fallback: derive from origin remote.
    proc = subprocess.run(["git", "remote", "get-url", "origin"], cwd=str(cwd), capture_output=True, text=True)
    if proc.returncode != 0:
        raise UserFacingError(
            message="cannot determine target repo (no --repo flag and no origin remote).",
            fix_hint="pass --repo owner/repo, or run inside a clone with `git remote add origin ...` configured.",
        )
    from dx.git_helpers import parse_owner_repo
    parsed = parse_owner_repo(proc.stdout.strip())
    if not parsed:
        raise UserFacingError(
            message=f"cannot parse owner/repo from origin URL '{proc.stdout.strip()}'",
            fix_hint="pass --repo owner/repo explicitly.",
        )
    return parsed


def _find_workflow(cwd: Path) -> Path:
    """Locate the generated PR workflow that the ruleset's required_checks derive from.

    Order:
      1. .github/workflows/pr.yml (the canonical landing place; GP-009a writes here)
      2. packages/framework/test/fixtures/expected-pr-pipeline.yml (PoC fallback
         when the fork hasn't run gen-fixtures yet)
    """
    for candidate in (
        cwd / ".github" / "workflows" / "pr.yml",
        cwd / "packages" / "framework" / "test" / "fixtures" / "expected-pr-pipeline.yml",
    ):
        if candidate.exists():
            return candidate
    raise UserFacingError(
        message="no generated PR workflow found.",
        fix_hint="run `pnpm --filter @golden-path/framework run gen-workflows` first.",
    )


governance_app = typer.Typer(help="Apply the platform GitHub ruleset (GP-008).")


@governance_app.command("apply", help="Apply the golden-path ruleset to the target repo (idempotent).")
def apply_command(
    repo: Optional[str] = typer.Option(None, "--repo", help="Target repo owner/name (default: derive from origin)."),
    dry_run: bool = typer.Option(False, "--dry-run", help="Print the planned operation without calling gh."),
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
    name: str = typer.Option("golden-path-default", "--name", help="Ruleset name."),
    signed_commits: bool = typer.Option(False, "--signed-commits", help="Opt-in: enforce signed commits."),
) -> None:
    if json_output:
        set_json_mode(True)
    cwd = Path.cwd()

    try:
        owner, repo_name = _resolve_repo(repo, cwd)
        workflow = _find_workflow(cwd)
        required = extract_blocking_jobs(workflow)
        body = build_default_ruleset(
            required_checks=required, name=name, signed_commits=signed_commits,
        )
    except UserFacingError as e:
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": e.message, "fix_hint": e.fix_hint}), err=True)
        else:
            emit_error("governance apply", e.message, e.fix_hint)
        raise typer.Exit(e.exit_code)

    plan = {
        "target_repo": f"{owner}/{repo_name}",
        "ruleset_name": name,
        "request_body": body,
        "existing_ruleset_id": None,
        "http_method": "POST",
        "endpoint": f"/repos/{owner}/{repo_name}/rulesets",
    }

    if dry_run:
        # Skip the list call too (dry-run promises no network).
        if json_output:
            typer.echo(_json.dumps(plan, separators=(",", ":")))
        else:
            typer.echo(_json.dumps(plan, indent=2))
        return

    if not _gh_available():
        err = UserFacingError(
            message="`gh` CLI not on PATH.",
            fix_hint="install gh: https://cli.github.com/, then run `gh auth login`.",
        )
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": err.message, "fix_hint": err.fix_hint}), err=True)
        else:
            emit_error("governance apply", err.message, err.fix_hint)
        raise typer.Exit(1)

    try:
        existing = list_rulesets(owner, repo_name)
    except UserFacingError as e:
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": e.message, "fix_hint": e.fix_hint}), err=True)
        else:
            emit_error("governance apply", e.message, e.fix_hint)
        raise typer.Exit(e.exit_code)

    match = next((r for r in existing if r.get("name") == name), None)
    if match is None:
        result = _gh_api("POST", f"/repos/{owner}/{repo_name}/rulesets", body=body)
        if not result.ok:
            emit_error("governance apply", f"POST failed: {result.stderr.strip()}", "")
            raise typer.Exit(1)
        created = _json.loads(result.stdout) if result.stdout.strip() else {}
        out = {"status": "created", "ruleset_id": created.get("id"), "target_repo": f"{owner}/{repo_name}"}
    else:
        rid = match["id"]
        result = _gh_api("PUT", f"/repos/{owner}/{repo_name}/rulesets/{rid}", body=body)
        if not result.ok:
            emit_error("governance apply", f"PUT failed: {result.stderr.strip()}", "")
            raise typer.Exit(1)
        out = {"status": "updated", "ruleset_id": rid, "target_repo": f"{owner}/{repo_name}"}

    if json_output:
        typer.echo(_json.dumps(out, separators=(",", ":")))
    else:
        typer.echo(_json.dumps(out, indent=2))
