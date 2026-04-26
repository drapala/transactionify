"""End-to-end smoke for `dx check` against the test fixtures."""
from __future__ import annotations

import json
from pathlib import Path

from typer.testing import CliRunner

from dx.cli import app


runner = CliRunner()
FIXTURE_DIR = Path(__file__).resolve().parent / "fixtures"


def test_check_passes_in_passing_repo(monkeypatch):
    monkeypatch.chdir(FIXTURE_DIR / "passing-repo")
    result = runner.invoke(app, ["check", "--json"])
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert payload["failures"] == [], f"expected no failures, got: {payload['failures']}"


def test_check_fails_in_failing_repo(monkeypatch):
    monkeypatch.chdir(FIXTURE_DIR / "failing-repo")
    result = runner.invoke(app, ["check", "--json"])
    assert result.exit_code != 0
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert any(f["check_name"] == "lint" for f in payload["failures"])


def test_check_lint_subcommand_runs_only_lint(monkeypatch):
    monkeypatch.chdir(FIXTURE_DIR / "passing-repo")
    result = runner.invoke(app, ["check", "lint", "--json"])
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert {r["name"] for r in payload["results"]} == {"lint"}
