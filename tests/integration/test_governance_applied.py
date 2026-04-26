"""Integration test: applies the platform ruleset to the candidate's fork
and asserts gh ruleset list reports it. Skips loudly when the preconditions
(gh CLI authed + admin on origin repo + origin is a fork) are not met.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import unittest


def _run(*args: str) -> tuple[int, str, str]:
    proc = subprocess.run(args, capture_output=True, text=True)
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()


def _origin_owner_repo() -> str | None:
    rc, out, _ = _run("git", "remote", "get-url", "origin")
    if rc != 0:
        return None
    url = out
    if url.startswith("git@"):
        # git@host:owner/repo.git
        if ":" in url:
            tail = url.split(":", 1)[1]
            return tail.removesuffix(".git")
    if url.startswith("http"):
        # https://host/owner/repo(.git)?
        parts = url.rstrip("/").rsplit("/", 2)
        if len(parts) >= 2:
            return f"{parts[-2]}/{parts[-1].removesuffix('.git')}"
    return None


class TestGovernanceApplied(unittest.TestCase):
    def setUp(self) -> None:
        if shutil.which("gh") is None:
            self.skipTest("gh CLI not installed")
        rc, *_ = _run("gh", "auth", "status")
        if rc != 0:
            self.skipTest("gh CLI not authenticated")
        self.repo = _origin_owner_repo()
        if not self.repo:
            self.skipTest("no parseable origin remote")
        if "rrgarciach/transactionify" in self.repo:
            self.skipTest("origin is upstream; integration test requires a fork")
        rc, out, _ = _run("gh", "api", f"/repos/{self.repo}", "--jq", ".permissions.admin")
        if rc != 0 or out.strip() != "true":
            self.skipTest(f"current gh user lacks admin on {self.repo}")

    def test_apply_then_observe_via_gh(self) -> None:
        rc, out, err = _run("dx", "governance", "apply", "--repo", self.repo, "--json")
        self.assertEqual(rc, 0, f"dx governance apply failed: {err or out}")
        result = json.loads(out.strip().splitlines()[-1]) if out.strip() else {}
        self.assertIn(result.get("status"), {"created", "updated"})

        # Older `gh` versions don't support `gh ruleset list --json`; query the
        # REST API directly via `gh api`. Same data, fewer client-version
        # surprises.
        rc, out, _ = _run("gh", "api", f"/repos/{self.repo}/rulesets")
        self.assertEqual(rc, 0)
        rulesets = json.loads(out)
        self.assertTrue(
            any(r.get("name") == "golden-path-default" for r in rulesets),
            f"golden-path-default not found in {rulesets}",
        )


if __name__ == "__main__":
    unittest.main()
