"""End-to-end smoke tests via the Typer CliRunner.

Asserts the seven command groups are registered and `dx hooks` is NOT a
top-level command.
"""
from __future__ import annotations

import json

from typer.testing import CliRunner

from dx.cli import app


runner = CliRunner()


def test_help_lists_seven_command_groups():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    out = result.stdout
    for cmd in ("init", "check", "branch", "pr", "governance", "local", "dora"):
        assert cmd in out, f"missing command group in --help: {cmd}"


def test_hooks_is_not_a_top_level_command():
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    # `dx init` ships the pre-push hook installer; `dx hooks` does NOT exist.
    # Loose check: no line consisting of optional indent + 'hooks' + word boundary.
    for line in result.stdout.splitlines():
        stripped = line.strip()
        # Skip any line that mentions hooks in prose (e.g. "pre-push hook").
        # But a registered command would appear as a token at start: "│ hooks  ..." or "  hooks  ..."
        # Reject if line starts with 'hooks' after stripping decorators.
        token = stripped.lstrip("│ ").split()
        if token and token[0] == "hooks":
            assert False, f"`hooks` appears as a top-level command: {line}"


def test_version_plain_matches_semver():
    result = runner.invoke(app, ["--version"])
    assert result.exit_code == 0
    import re

    assert re.match(r"\d+\.\d+\.\d+", result.stdout.strip())


def test_version_json_emits_object():
    result = runner.invoke(app, ["--version", "--json"])
    assert result.exit_code == 0
    parsed = json.loads(result.stdout.strip().splitlines()[-1])
    # --version --json emits flat {"version": "x.y.z"} per GP-002 scenario.
    assert "version" in parsed
    import re as _re
    assert _re.match(r"\d+\.\d+\.\d+", parsed["version"])


def test_stub_command_exits_nonzero_with_user_facing_error():
    result = runner.invoke(app, ["check"])
    # Stub raises UserFacingError → caller's exit_code is 2 (typer Exit) — but
    # the stub is invoked as the callback so the runner sees the exception.
    # We accept any non-zero exit; the contract is that stubs do NOT silently 0.
    assert result.exit_code != 0
