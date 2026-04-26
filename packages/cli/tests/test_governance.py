"""Tests for `dx governance apply` (extract + build + dry-run flow)."""
from __future__ import annotations

import json
from pathlib import Path

import pytest
from typer.testing import CliRunner

from dx.cli import app
from dx.commands.governance import build_default_ruleset, extract_blocking_jobs

runner = CliRunner()
PR_FIXTURE = Path(__file__).resolve().parents[2] / "framework" / "test" / "fixtures" / "expected-pr-pipeline.yml"


# fall back to repo root path resolution
if not PR_FIXTURE.exists():
    PR_FIXTURE = Path(__file__).resolve().parents[3] / "packages" / "framework" / "test" / "fixtures" / "expected-pr-pipeline.yml"


def test_extract_blocking_jobs_excludes_ai_review_and_dora_emit():
    blocking = extract_blocking_jobs(PR_FIXTURE)
    assert "ai-review" not in blocking
    assert "dora-emit" not in blocking
    assert "sandbox-verify" in blocking
    assert "lint" in blocking


def test_build_default_ruleset_shape_matches_github_api():
    rs = build_default_ruleset(required_checks=["lint", "unit-tests"])
    assert rs["target"] == "branch"
    assert rs["conditions"]["ref_name"]["include"] == ["refs/heads/main"]
    assert rs["enforcement"] == "active"
    types = [r["type"] for r in rs["rules"]]
    assert "pull_request" in types
    assert "required_status_checks" in types
    assert "deletion" in types
    assert "non_fast_forward" in types
    assert "required_signatures" not in types


def test_required_signatures_opt_in_only():
    rs = build_default_ruleset(required_checks=["lint"], signed_commits=True)
    assert any(r["type"] == "required_signatures" for r in rs["rules"])


def test_empty_required_checks_raises():
    from dx.errors import UserFacingError
    with pytest.raises(UserFacingError):
        build_default_ruleset(required_checks=[])


def test_dry_run_emits_plan_without_calling_gh(monkeypatch, tmp_path):
    # Simulate a fork-style cwd where the fixture is reachable via packages/framework/...
    # We use --repo to bypass git origin lookup.
    monkeypatch.chdir(Path(__file__).resolve().parents[3])  # repo root
    result = runner.invoke(app, ["governance", "apply", "--dry-run", "--repo", "owner/repo", "--json"])
    assert result.exit_code == 0, result.output
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert payload["target_repo"] == "owner/repo"
    assert payload["http_method"] == "POST"
    assert payload["endpoint"] == "/repos/owner/repo/rulesets"
    rules = payload["request_body"]["rules"]
    assert len(rules) >= 4
    assert any(r["type"] == "required_status_checks" for r in rules)
    assert not any(r["type"] == "required_signatures" for r in rules)
