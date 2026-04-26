"""Thin wrapper over `gh` CLI. GP-008 will extend this for ruleset operations.

We shell out to `gh` rather than reimplement OAuth + REST + pagination —
gh is the platform's officially supported GitHub client and is on the
critical-path image for any team running the workflows GP-007 emits.
"""
from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass


class GhMissingError(RuntimeError):
    pass


@dataclass
class PrCreated:
    number: int | None
    url: str
    raw: str


def gh_available() -> bool:
    return shutil.which("gh") is not None


def gh_pr_create(
    *, title: str, body: str, base: str, head: str, cwd: str | None = None,
) -> PrCreated:
    if not gh_available():
        raise GhMissingError("`gh` CLI is not on PATH. Install: https://cli.github.com/")
    proc = subprocess.run(
        ["gh", "pr", "create", "--title", title, "--body", body, "--base", base, "--head", head],
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"gh pr create failed: {proc.stderr.strip()}")
    out = proc.stdout.strip()
    # gh prints the PR URL on success.
    url = out.splitlines()[-1] if out else ""
    number = None
    if url:
        # https://github.com/owner/repo/pull/123 → 123
        try:
            number = int(url.rstrip("/").rsplit("/", 1)[-1])
        except ValueError:
            number = None
    return PrCreated(number=number, url=url, raw=out)
