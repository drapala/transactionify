"""End-to-end smoke for `dx dora summarize` via CliRunner."""
from __future__ import annotations

import json
from pathlib import Path

from typer.testing import CliRunner

from dx.cli import app

runner = CliRunner()
FIX = Path(__file__).resolve().parent / "fixtures" / "dora-events"


def test_summarize_single_success_json():
    result = runner.invoke(app, ["dora", "summarize", "--events", str(FIX / "single-success.jsonl"), "--json"])
    assert result.exit_code == 0, result.output
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert all(k in payload for k in (
        "deployment_frequency",
        "lead_time_for_changes_seconds",
        "change_failure_rate",
        "mean_time_to_restore_seconds",
        "window",
        "total_events_seen",
        "total_events_used",
        "schema_version",
    ))


def test_summarize_empty_explicit_zeros():
    result = runner.invoke(app, ["dora", "summarize", "--events", str(FIX / "empty.jsonl"), "--json"])
    assert result.exit_code == 0
    payload = json.loads(result.stdout.strip().splitlines()[-1])
    assert payload["total_events_used"] == 0
    assert payload["deployment_frequency"] == 0


def test_summarize_invalid_event_exits_nonzero():
    result = runner.invoke(app, ["dora", "summarize", "--events", str(FIX / "missing-commit-authored-at.jsonl"), "--json"])
    assert result.exit_code != 0


def test_summarize_help_mentions_window_and_events():
    result = runner.invoke(app, ["dora", "summarize", "--help"])
    assert result.exit_code == 0
    assert "--window" in result.stdout
    assert "--events" in result.stdout
