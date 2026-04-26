"""dx pr — local validation BEFORE network call; --dry-run skips network."""
from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import pytest
from typer.testing import CliRunner

from dx.cli import app


runner = CliRunner()
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "branched-repo"


@pytest.fixture(scope="module", autouse=True)
def _materialise_fixture():
    subprocess.run(["bash", str(FIXTURE / "bootstrap.sh")], check=True)
    yield


def test_dry_run_emits_work_id_and_does_not_call_gh(monkeypatch):
    monkeypatch.chdir(FIXTURE)
    result = runner.invoke(app, ["pr", "--dry-run", "--json"])
    assert result.exit_code == 0, result.output
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert payload["work_id"] == "GP-123"
    assert payload["title"] == "GP-123: feat add validator"
    assert payload["validation"] == "passed"
    assert payload["base"] == "main"
    assert payload["head"] == "GP-123-feat-add-validator"


def test_dry_run_fails_on_non_conformant_branch(tmp_path, monkeypatch):
    subprocess.run(["git", "init", "-b", "main", "-q"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.email", "t@x"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.name", "t"], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "--allow-empty", "-q", "-m", "init"], cwd=tmp_path, check=True)
    subprocess.run(["git", "checkout", "-q", "-b", "feature/foo"], cwd=tmp_path, check=True)
    monkeypatch.chdir(tmp_path)
    result = runner.invoke(app, ["pr", "--dry-run"])
    assert result.exit_code != 0


def test_pr_help_mentions_dry_run():
    result = runner.invoke(app, ["pr", "--help"])
    assert result.exit_code == 0
    assert "dry-run" in result.stdout
