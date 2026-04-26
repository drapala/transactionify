"""`dx dora summarize` — compute the 4 PDF DORA metrics from a raw events JSONL.

Same code path consumes both fixtures and the artifact GP-007's dora-emit
step uploads. No special CI mode — the demo's closing beat is identical
to a unit test.
"""
from __future__ import annotations

import json as _json
import re
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from dx.dora.aggregate import summarize
from dx.dora.load import load_events
from dx.errors import UserFacingError
from dx.output import emit_error, set_json_mode

console = Console()


def _parse_window(s: str) -> float:
    m = re.match(r"^(\d+(?:\.\d+)?)d$", s)
    if not m:
        raise UserFacingError(
            message=f"--window must look like '7d' or '1.5d'; got '{s}'",
            fix_hint="use the form Nd where N is days (e.g. 7d, 30d).",
            exit_code=2,
        )
    return float(m.group(1))


def _format_seconds(s: float | None) -> str:
    if s is None:
        return "n/a"
    if s < 60:
        return f"{s:.1f}s"
    if s < 3600:
        return f"{s/60:.1f} min"
    if s < 86400:
        return f"{s/3600:.1f} h"
    return f"{s/86400:.2f} days"


def _emit_human(payload: dict) -> None:
    table = Table(title="DORA — 4 PDF metrics", show_header=True, header_style="bold")
    table.add_column("metric")
    table.add_column("value")
    table.add_row("Deployment Frequency", f"{payload['deployment_frequency']:.4f} per day")
    table.add_row("Lead Time for Changes", _format_seconds(payload["lead_time_for_changes_seconds"]))
    table.add_row("Change Failure Rate", f"{payload['change_failure_rate']:.2%}")
    table.add_row("Mean Time to Restore", _format_seconds(payload["mean_time_to_restore_seconds"]))
    table.add_section()
    table.add_row("window", payload["window"])
    table.add_row("events seen", str(payload["total_events_seen"]))
    table.add_row("events used", str(payload["total_events_used"]))
    console.print(table)


dora_app = typer.Typer(help="DORA aggregator: 4 PDF metrics from raw events (GP-013).")


@dora_app.command("summarize", help="Compute the 4 DORA metrics from a JSONL of raw events.")
def summarize_command(
    events: Path = typer.Option(..., "--events", help="Path to JSONL of GP-001 events."),
    window: str = typer.Option("7d", "--window", help="Aggregation window, e.g. 7d, 30d."),
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
) -> None:
    if json_output:
        set_json_mode(True)
    try:
        window_days = _parse_window(window)
        loaded = load_events(events)
        summary = summarize(loaded, window_days)
    except (FileNotFoundError, ValueError) as e:
        msg = str(e)
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": msg}), err=True)
        else:
            emit_error("dora summarize", msg, "")
        raise typer.Exit(1)
    except UserFacingError as e:
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": e.message, "fix_hint": e.fix_hint}), err=True)
        else:
            emit_error("dora summarize", e.message, e.fix_hint)
        raise typer.Exit(e.exit_code)

    if json_output:
        typer.echo(_json.dumps(summary, separators=(",", ":")))
    else:
        _emit_human(summary)
