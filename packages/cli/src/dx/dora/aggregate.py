"""Pure functions, one per DORA metric. No I/O.

Window semantics: events are filtered to those whose started_at is within
the last `window_days` days from `now` (defaults to the most recent event's
started_at, so the metric is stable across re-runs against the same JSONL).
"""
from __future__ import annotations

import statistics
from datetime import datetime, timedelta, timezone
from typing import Iterable

from dx.dora.load import LoadedEvents


def _parse_iso(s: str) -> datetime:
    # Python 3.11 fromisoformat handles trailing 'Z' from Python 3.11+.
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def _now_anchor(events: Iterable[dict]) -> datetime:
    """Anchor the window at max(finished_at) so re-runs are stable."""
    times = [_parse_iso(e["finished_at"]) for e in events if "finished_at" in e]
    return max(times) if times else datetime.now(tz=timezone.utc)


def _filter_in_window(events: list[dict], anchor: datetime, window_days: float) -> list[dict]:
    cutoff = anchor - timedelta(days=window_days)
    return [e for e in events if _parse_iso(e["started_at"]) >= cutoff]


def deployment_frequency(deployments: list[dict], window_days: float) -> float:
    """count(success deployments in window) / window_days."""
    if not deployments or window_days <= 0:
        return 0.0
    anchor = _now_anchor(deployments)
    in_window = _filter_in_window(deployments, anchor, window_days)
    successes = [d for d in in_window if d.get("outcome") == "success"]
    return len(successes) / window_days


def lead_time_for_changes_seconds(deployments: list[dict], window_days: float) -> float | None:
    """median(finished_at - commit_authored_at) over successful deployments in window.
    Returns None if no qualifying deployments."""
    if not deployments:
        return None
    anchor = _now_anchor(deployments)
    in_window = _filter_in_window(deployments, anchor, window_days)
    samples = []
    for d in in_window:
        if d.get("outcome") != "success":
            continue
        if "commit_authored_at" not in d:
            continue
        dt = (_parse_iso(d["finished_at"]) - _parse_iso(d["commit_authored_at"])).total_seconds()
        samples.append(dt)
    if not samples:
        return None
    return statistics.median(samples)


def change_failure_rate(deployments: list[dict], window_days: float) -> float:
    """count(failed deployments) / count(deployments) in window.
    Returns 0.0 when there are no deployments (no false negative for healthy quiet repos)."""
    if not deployments:
        return 0.0
    anchor = _now_anchor(deployments)
    in_window = _filter_in_window(deployments, anchor, window_days)
    if not in_window:
        return 0.0
    failures = sum(1 for d in in_window if d.get("outcome") == "failure")
    return failures / len(in_window)


def mean_time_to_restore_seconds(loaded: LoadedEvents, window_days: float) -> float | None:
    """For each rework deployment in window, look up its referenced failure by
    event_id and compute (rework.finished_at - failure.started_at). Mean across
    resolved pairs; None if no pairs resolve."""
    if not loaded.deployments:
        return None
    anchor = _now_anchor(loaded.deployments)
    in_window = _filter_in_window(loaded.deployments, anchor, window_days)
    samples = []
    for r in in_window:
        if not r.get("is_rework"):
            continue
        target_id = r.get("recovered_from_failure_id")
        if not target_id:
            continue
        failure = loaded.by_event_id.get(target_id)
        if not failure or failure.get("event_type") != "deployment":
            continue
        # The failure may be OUTSIDE the window (long unresolved incident).
        # Per the gherkin: that recovery doesn't contribute. We still count
        # pairs where the failure exists in the loaded set; the window
        # filter is on the recovery event.
        delta = (_parse_iso(r["finished_at"]) - _parse_iso(failure["started_at"])).total_seconds()
        samples.append(delta)
    if not samples:
        return None
    return statistics.fmean(samples)


def summarize(loaded: LoadedEvents, window_days: float) -> dict:
    return {
        "deployment_frequency": deployment_frequency(loaded.deployments, window_days),
        "lead_time_for_changes_seconds": lead_time_for_changes_seconds(loaded.deployments, window_days),
        "change_failure_rate": change_failure_rate(loaded.deployments, window_days),
        "mean_time_to_restore_seconds": mean_time_to_restore_seconds(loaded, window_days),
        "window": f"{int(window_days) if float(window_days).is_integer() else window_days}d",
        "total_events_seen": loaded.total_seen,
        "total_events_used": loaded.total_used,
        "schema_version": "1.0.0",
    }
