"""Thin wrappers over git for branch / commit / remote inspection.

All functions accept an optional cwd so tests can drive them against
fixture repos without chdir contamination.
"""
from __future__ import annotations

import re
import subprocess
import unicodedata
from dataclasses import dataclass


def _git(*args: str, cwd: str | None = None) -> tuple[int, str, str]:
    proc = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True)
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def current_branch(cwd: str | None = None) -> str | None:
    rc, out, _ = _git("rev-parse", "--abbrev-ref", "HEAD", cwd=cwd)
    return out if rc == 0 else None


def latest_commit_subject(cwd: str | None = None) -> str | None:
    rc, out, _ = _git("log", "-1", "--format=%s", cwd=cwd)
    return out if rc == 0 and out else None


def origin_url(cwd: str | None = None) -> str | None:
    rc, out, _ = _git("remote", "get-url", "origin", cwd=cwd)
    return out if rc == 0 else None


def slugify(text: str) -> str:
    """Convert a free-form title to a filesystem-safe lowercase slug.

    'feat: add local env!' → 'feat-add-local-env'
    """
    norm = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    norm = norm.lower()
    # Replace any run of non-alnum with a dash; strip leading/trailing dashes.
    norm = re.sub(r"[^a-z0-9]+", "-", norm).strip("-")
    return norm or "change"


@dataclass
class RepoInfo:
    branch: str | None
    latest_subject: str | None
    origin: str | None
    is_clean: bool


def repo_info(cwd: str | None = None) -> RepoInfo:
    branch = current_branch(cwd=cwd)
    subject = latest_commit_subject(cwd=cwd)
    remote = origin_url(cwd=cwd)
    rc, out, _ = _git("status", "--porcelain", cwd=cwd)
    is_clean = rc == 0 and out == ""
    return RepoInfo(branch=branch, latest_subject=subject, origin=remote, is_clean=is_clean)


def parse_owner_repo(remote_url: str) -> tuple[str, str] | None:
    """Extract (owner, repo) from a GitHub remote URL.

    Handles:
      - https://github.com/owner/repo.git
      - https://github.com/owner/repo
      - git@github.com:owner/repo.git
    """
    m = re.match(r"https?://[^/]+/([^/]+)/([^/.]+?)(?:\.git)?/?$", remote_url)
    if m:
        return m.group(1), m.group(2)
    m = re.match(r"git@[^:]+:([^/]+)/([^/.]+?)(?:\.git)?$", remote_url)
    if m:
        return m.group(1), m.group(2)
    return None
