"""work_id check — branch + commit subjects locally; PR title in CI.

Sources of truth: CHECK_MANIFEST['work_id'] for the three regexes
(branch_pattern, subject_pattern, extract_pattern). No regex is repeated
anywhere else in the codebase — `dx branch`, `dx pr`, and the workflow
generator all import from CHECK_MANIFEST too.
"""
from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass

from dx.checks.manifest import CHECK_MANIFEST


@dataclass
class WorkIdResult:
    status: str  # pass | fail | skip
    detail: str
    fix_hint: str = ""


def _git(*args: str, cwd: str | None = None) -> tuple[int, str, str]:
    proc = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True)
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def _current_branch(cwd: str | None = None) -> str | None:
    rc, out, _ = _git("rev-parse", "--abbrev-ref", "HEAD", cwd=cwd)
    if rc != 0:
        return None
    return out


def _commit_subjects_since_main(cwd: str | None = None) -> list[tuple[str, str]]:
    """Return list of (sha, subject) since merge-base with origin/main or main.
    If neither ref exists, return commits on this branch only (best-effort)."""
    base = None
    for ref in ("origin/main", "main", "origin/master", "master"):
        rc, _, _ = _git("rev-parse", "--verify", ref, cwd=cwd)
        if rc == 0:
            base = ref
            break
    if base is None:
        # No base ref — return last 20 commits as best-effort.
        rc, out, _ = _git("log", "-n", "20", "--pretty=%H%x09%s", cwd=cwd)
    else:
        rc, out, _ = _git("log", f"{base}..HEAD", "--pretty=%H%x09%s", cwd=cwd)
    if rc != 0 or not out:
        return []
    rows = []
    for line in out.splitlines():
        if "\t" in line:
            sha, subject = line.split("\t", 1)
            rows.append((sha, subject))
    return rows


def check_work_id(*, cwd: str | None = None) -> WorkIdResult:
    branch_pattern = CHECK_MANIFEST["work_id"]["branch_pattern"]
    subject_pattern = CHECK_MANIFEST["work_id"]["subject_pattern"]

    rc, _, _ = _git("rev-parse", "--git-dir", cwd=cwd)
    if rc != 0:
        return WorkIdResult(status="skip", detail="not a git repo (work_id check skipped)")

    branch = _current_branch(cwd=cwd)
    if branch is None or branch == "HEAD":
        return WorkIdResult(
            status="skip",
            detail="detached HEAD or no branch (work_id check skipped)",
        )

    if not re.match(branch_pattern, branch):
        return WorkIdResult(
            status="fail",
            detail=f"branch '{branch}' does not match {branch_pattern}",
            fix_hint="rename via `git branch -m <work-id>-<slug>` (e.g. GP-123-feat-add-validator).",
        )

    bad_commits = []
    for sha, subject in _commit_subjects_since_main(cwd=cwd):
        if not re.match(subject_pattern, subject):
            bad_commits.append((sha[:7], subject))

    if bad_commits:
        listing = "; ".join(f"{sha} {subj!r}" for sha, subj in bad_commits)
        return WorkIdResult(
            status="fail",
            detail=f"commit subjects do not match {subject_pattern}: {listing}",
            fix_hint="reword via `git rebase -i <base>` and prefix each subject with `<work-id>: `.",
        )

    return WorkIdResult(status="pass", detail=f"branch + {len(_commit_subjects_since_main(cwd=cwd))} commit(s) match {branch_pattern}")
