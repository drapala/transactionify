"""Cover work_id check across the three contexts (branch / commits / skip-when-non-git)."""
from __future__ import annotations

import os
import subprocess
from pathlib import Path

import pytest

from dx.checks.work_id import check_work_id


def _git(*args: str, cwd: Path) -> None:
    subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True)


def _init_repo(path: Path, *, branch: str = "main") -> None:
    _git("init", "-b", branch, cwd=path)
    _git("config", "user.email", "test@example.com", cwd=path)
    _git("config", "user.name", "Test", cwd=path)
    _git("commit", "--allow-empty", "-m", "initial", cwd=path)


def test_skip_when_not_a_git_repo(tmp_path):
    r = check_work_id(cwd=str(tmp_path))
    assert r.status == "skip"


def test_pass_with_conformant_branch_and_commits(tmp_path):
    _init_repo(tmp_path)
    _git("checkout", "-b", "GP-123-feat-add-validator", cwd=tmp_path)
    (tmp_path / "a.txt").write_text("a")
    _git("add", "a.txt", cwd=tmp_path)
    _git("commit", "-m", "GP-123: feat add validator", cwd=tmp_path)
    r = check_work_id(cwd=str(tmp_path))
    assert r.status == "pass", r.detail


def test_fail_on_non_conformant_branch(tmp_path):
    _init_repo(tmp_path)
    _git("checkout", "-b", "feature/random", cwd=tmp_path)
    r = check_work_id(cwd=str(tmp_path))
    assert r.status == "fail"
    assert "branch" in r.detail.lower()


def test_fail_on_bracketed_commit_subject(tmp_path):
    _init_repo(tmp_path)
    _git("checkout", "-b", "GP-7-test", cwd=tmp_path)
    (tmp_path / "x").write_text("x")
    _git("add", "x", cwd=tmp_path)
    # `[GP-7] description` is the disallowed bracketed shape.
    _git("commit", "-m", "[GP-7] feat thing", cwd=tmp_path)
    r = check_work_id(cwd=str(tmp_path))
    assert r.status == "fail"
    assert "rebase" in r.fix_hint.lower() or "reword" in r.fix_hint.lower()
