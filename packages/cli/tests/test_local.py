"""Tests for `dx local up` health-check timeout (P1-8 — proves the fail-loud
claim is structural, not documentation-only).
"""
from __future__ import annotations

from unittest import mock
from typer.testing import CliRunner

from dx.cli import app
from dx.commands import local as local_module

runner = CliRunner()


def test_health_timeout_exits_nonzero(monkeypatch):
    """When LocalStack health endpoint never reports services running for the
    full timeout window, `dx local up` exits non-zero with stderr message."""
    # Mock docker compose call to succeed (we're not testing docker; we're
    # testing the health-check timeout path).
    fake_proc = mock.Mock()
    fake_proc.returncode = 0
    fake_proc.stdout = ""
    fake_proc.stderr = ""

    seed_calls: list = []

    def fake_run(cmd, **kw):
        if cmd[:3] == ["docker", "compose", "up"]:
            return fake_proc
        seed_calls.append(cmd)
        return fake_proc

    monkeypatch.setattr(local_module.subprocess, "run", fake_run)
    monkeypatch.setattr(local_module, "_docker_compose_available", lambda: True)
    # Force health to never become OK by returning a structurally-incomplete payload.
    monkeypatch.setattr(local_module, "wait_for_healthy", lambda **_: (False, {"services": {"dynamodb": "starting"}}))

    result = runner.invoke(app, ["local", "up", "--timeout", "1", "--json"])
    assert result.exit_code != 0
    # Seed must NOT be invoked on timeout.
    assert seed_calls == [], f"seed must not be called on timeout; got: {seed_calls}"


def test_health_timeout_skips_seed(monkeypatch):
    """Specifically asserts no seed subprocess runs when timeout fires."""
    monkeypatch.setattr(local_module, "_docker_compose_available", lambda: True)

    invocations: list = []

    def fake_run(cmd, **kw):
        invocations.append(cmd)
        rv = mock.Mock()
        rv.returncode = 0
        rv.stdout = ""
        rv.stderr = ""
        return rv

    monkeypatch.setattr(local_module.subprocess, "run", fake_run)
    monkeypatch.setattr(local_module, "wait_for_healthy", lambda **_: (False, None))

    result = runner.invoke(app, ["local", "up", "--timeout", "1", "--json"])
    assert result.exit_code != 0
    seed_calls = [c for c in invocations if any("seed_dynamodb" in str(p) for p in c)]
    assert seed_calls == []


def test_services_healthy_helper():
    assert local_module._services_healthy({"services": {"dynamodb": "running"}}) is True
    assert local_module._services_healthy({"services": {"dynamodb": "available"}}) is True
    assert local_module._services_healthy({"services": {"dynamodb": "starting"}}) is False
    assert local_module._services_healthy({"services": {}}) is False
    assert local_module._services_healthy({}) is False
    # LocalStack returns the full catalog with disabled services; only the
    # enabled ones should drive the healthy verdict.
    full = {
        "services": {
            "dynamodb": "running",
            "dynamodbstreams": "available",
            "lambda": "disabled",
            "s3": "disabled",
            "kinesis": "available",
        }
    }
    assert local_module._services_healthy(full) is True
    # Even one enabled-but-not-running service blocks healthy.
    blocked = {"services": {**full["services"], "dynamodb": "starting"}}
    assert local_module._services_healthy(blocked) is False
