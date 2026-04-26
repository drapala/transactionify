"""dx branch — slug formatting + work_id validation."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest
from typer.testing import CliRunner

from dx.cli import app
from dx.commands.branch import _build_branch_name


runner = CliRunner()


def _git_repo(tmp: Path) -> None:
    subprocess.run(["git", "init", "-b", "main", "-q"], cwd=tmp, check=True)
    subprocess.run(["git", "config", "user.email", "t@x"], cwd=tmp, check=True)
    subprocess.run(["git", "config", "user.name", "t"], cwd=tmp, check=True)
    subprocess.run(["git", "commit", "--allow-empty", "-q", "-m", "init"], cwd=tmp, check=True)


def test_build_branch_name_slugifies():
    assert _build_branch_name("GP-123", "feat: add local env!") == "GP-123-feat-add-local-env"
    assert _build_branch_name("LL-7", "Fix Stuff & Things") == "LL-7-fix-stuff-things"


def test_branch_creates_branch_in_real_repo(tmp_path, monkeypatch):
    _git_repo(tmp_path)
    monkeypatch.chdir(tmp_path)
    result = runner.invoke(app, ["branch", "GP-123", "feat: add validator", "--json"])
    assert result.exit_code == 0, result.output
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert payload["branch_name"] == "GP-123-feat-add-validator"
    assert payload["work_id"] == "GP-123"
    # Confirm branch exists in git.
    out = subprocess.run(["git", "branch", "--show-current"], cwd=tmp_path, capture_output=True, text=True)
    assert out.stdout.strip() == "GP-123-feat-add-validator"


def test_branch_rejects_invalid_work_id(tmp_path, monkeypatch):
    _git_repo(tmp_path)
    monkeypatch.chdir(tmp_path)
    result = runner.invoke(app, ["branch", "FOO-999", "feat: x"])
    assert result.exit_code != 0
    out = subprocess.run(["git", "branch", "--show-current"], cwd=tmp_path, capture_output=True, text=True)
    # Branch should still be `main` — no FOO-999 branch was created.
    assert out.stdout.strip() == "main"


def test_branch_help_mentions_work_id():
    result = runner.invoke(app, ["branch", "--help"])
    assert result.exit_code == 0
    assert "work_id" in result.stdout.lower() or "work-id" in result.stdout.lower() or "GP-123" in result.stdout
