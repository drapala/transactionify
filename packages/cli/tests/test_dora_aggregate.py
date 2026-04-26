"""Aggregation correctness against fixture event sets."""
from __future__ import annotations

from pathlib import Path

import pytest

from dx.dora.aggregate import (
    change_failure_rate,
    deployment_frequency,
    lead_time_for_changes_seconds,
    mean_time_to_restore_seconds,
    summarize,
)
from dx.dora.load import load_events


FIX = Path(__file__).resolve().parent / "fixtures" / "dora-events"


def test_single_success_metrics_sane():
    loaded = load_events(FIX / "single-success.jsonl")
    assert loaded.total_seen == 2
    assert len(loaded.deployments) == 1
    assert len(loaded.pipeline_runs) == 1
    summary = summarize(loaded, window_days=7)
    assert summary["deployment_frequency"] == pytest.approx(1 / 7)
    # commit_authored_at 11:30 -> finished_at 13:05 = 5700s
    assert summary["lead_time_for_changes_seconds"] == pytest.approx(5700.0)
    assert summary["change_failure_rate"] == 0.0  # no failures
    assert summary["mean_time_to_restore_seconds"] is None  # no rework
    assert summary["window"] == "7d"
    assert summary["total_events_used"] == 2


def test_mixed_failure_recovery_mttr_resolves():
    loaded = load_events(FIX / "mixed-failure-recovery.jsonl")
    summary = summarize(loaded, window_days=7)
    # Two deployments: one failure (14:00-14:03), one success rework (15:00-15:18).
    # CFR = 1/2 = 0.5
    assert summary["change_failure_rate"] == 0.5
    # MTTR: recovery.finished_at(15:18) - failure.started_at(14:00) = 1h18m = 4680s
    assert summary["mean_time_to_restore_seconds"] is not None
    assert summary["mean_time_to_restore_seconds"] == pytest.approx(4680.0)
    # Lead time: only successful deployment is the recovery; commit_authored_at 14:55 -> finished 15:18 = 1380s
    assert summary["lead_time_for_changes_seconds"] == pytest.approx(1380.0)


def test_empty_file_yields_explicit_zero_or_null():
    loaded = load_events(FIX / "empty.jsonl")
    summary = summarize(loaded, window_days=7)
    assert summary["deployment_frequency"] == 0
    assert summary["change_failure_rate"] == 0.0
    assert summary["lead_time_for_changes_seconds"] is None
    assert summary["mean_time_to_restore_seconds"] is None
    assert summary["total_events_seen"] == 0
    assert summary["total_events_used"] == 0


def test_missing_commit_authored_at_is_rejected_at_load():
    with pytest.raises(ValueError) as exc:
        load_events(FIX / "missing-commit-authored-at.jsonl")
    assert "commit_authored_at" in str(exc.value)
    assert "line 1" in str(exc.value)


def test_unresolved_rework_does_not_crash(tmp_path):
    """A rework deployment whose recovered_from_failure_id is not in the loaded
    set is silently skipped (per gherkin). MTTR is None when no pair resolves."""
    f = tmp_path / "unresolved.jsonl"
    f.write_text(
        '{"event_id":"0192f7d4-9c4d-7e5f-abcd-234567890301","schema_version":"1.0.0",'
        '"event_type":"deployment","service":"x","repository":"a/b","commit_sha":"abcdefa",'
        '"actor":"u","work_id":"GP-1","change_summary":"recovery, but failure event missing",'
        '"outcome":"success","started_at":"2026-04-26T17:00:00Z","finished_at":"2026-04-26T17:05:00Z",'
        '"commit_authored_at":"2026-04-26T16:55:00Z",'
        '"is_rework":true,"recovered_from_failure_id":"0192fabc-1234-7777-8888-999999999999"}\n'
    )
    loaded = load_events(f)
    summary = summarize(loaded, window_days=7)
    assert summary["mean_time_to_restore_seconds"] is None
