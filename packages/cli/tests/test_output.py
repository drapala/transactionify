"""Tests for the output dispatch module.

Asserts that:
  - emit_success in JSON mode writes a single parseable JSON line with the
    documented schema (command, status, duration_ms, payload).
  - emit_error in JSON mode writes the same shape with status='error'.
  - human mode emits Rich-formatted output (panels) and does NOT emit
    raw JSON on stdout.
"""
from __future__ import annotations

import json
import re

from dx import output


def test_machine_success_emits_documented_schema(capsys):
    output.set_json_mode(True)
    try:
        output.emit_success("version", {"version": "0.1.0"}, duration_ms=12)
    finally:
        output.set_json_mode(False)
    captured = capsys.readouterr()
    parsed = json.loads(captured.out.strip())
    assert parsed["command"] == "version"
    assert parsed["status"] == "ok"
    assert parsed["duration_ms"] == 12
    assert parsed["payload"] == {"version": "0.1.0"}


def test_machine_error_emits_status_error_and_fix_hint(capsys):
    output.set_json_mode(True)
    try:
        output.emit_error("init", "missing pyproject.toml", "run uv init")
    finally:
        output.set_json_mode(False)
    captured = capsys.readouterr()
    parsed = json.loads(captured.out.strip())
    assert parsed["status"] == "error"
    assert parsed["payload"]["message"] == "missing pyproject.toml"
    assert parsed["payload"]["fix_hint"] == "run uv init"


def test_human_success_does_not_emit_raw_json(capsys):
    # Force a fixed-width Console to make the test deterministic across terms.
    output.set_json_mode(False)
    output.emit_success("version", {"version": "0.1.0"})
    captured = capsys.readouterr()
    # Human output should NOT be parseable as JSON (Rich panels include borders).
    stripped = captured.out.strip()
    assert stripped, "human mode emitted nothing"
    try:
        json.loads(stripped)
        assert False, "human mode should not emit JSON; got JSON-parseable output"
    except json.JSONDecodeError:
        pass


def test_machine_payload_is_single_line(capsys):
    """JSON output must be one line per emission so callers can split on \\n."""
    output.set_json_mode(True)
    try:
        output.emit_success("x", {"a": 1, "b": [1, 2, 3]})
    finally:
        output.set_json_mode(False)
    out = capsys.readouterr().out
    # Exactly one newline at the end, no embedded newlines.
    assert out.count("\n") == 1
    json.loads(out.strip())


def test_json_mode_toggle():
    assert output.is_json_mode() is False
    output.set_json_mode(True)
    assert output.is_json_mode() is True
    output.set_json_mode(False)
    assert output.is_json_mode() is False


def test_semver_pattern_helper():
    """Sanity check that __version__ matches the validation_commands regex."""
    from dx import __version__
    assert re.match(r"\d+\.\d+\.\d+", __version__)
