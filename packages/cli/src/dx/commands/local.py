"""`dx local up | down` — wraps docker compose for LocalStack lifecycle.

Health-check is fail-loud: if LocalStack does not report 'running' for all
declared services within --timeout seconds, `dx local up` exits non-zero
and DOES NOT run the seed script. Stale-or-empty seeded tables are worse
than an explicit error for the demo.
"""
from __future__ import annotations

import json as _json
import os
import shutil
import subprocess
import time
from pathlib import Path
from typing import Optional

import typer

from dx.errors import UserFacingError
from dx.output import emit_error, set_json_mode

local_app = typer.Typer(help="LocalStack + seeded DynamoDB lifecycle (GP-009d).")

DEFAULT_HEALTH_URL = "http://localhost:4566/_localstack/health"


def _docker_compose_available() -> bool:
    return shutil.which("docker") is not None


def _http_get_json(url: str, timeout_seconds: float):
    """Minimal stdlib HTTP GET → JSON. Avoids adding `requests` as a dep."""
    import urllib.error
    import urllib.request

    req = urllib.request.Request(url, headers={"User-Agent": "dx-local"})
    with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
        if resp.status != 200:
            raise urllib.error.HTTPError(url, resp.status, "non-200", resp.headers, None)
        return _json.loads(resp.read().decode("utf-8"))


def _services_healthy(payload: dict) -> bool:
    """Healthy when every NOT-disabled service reports running/available.

    LocalStack's /_localstack/health returns the full catalog (~30 services)
    with most marked 'disabled' (we only enabled SERVICES=dynamodb in
    docker-compose.yml). A naive `all(running)` over the whole dict would
    never be True. Filter disabled out, then require at least one enabled
    service to be running.
    """
    services = payload.get("services") if isinstance(payload, dict) else None
    if not services:
        return False
    enabled = {k: v for k, v in services.items() if v != "disabled"}
    if not enabled:
        return False
    return all(v in ("running", "available") for v in enabled.values())


def wait_for_healthy(
    *,
    health_url: str = DEFAULT_HEALTH_URL,
    timeout_seconds: int = 30,
    poll_interval: float = 2.0,
) -> tuple[bool, dict | None]:
    """Poll the health endpoint until services are healthy or timeout. Returns (ok, last_response)."""
    deadline = time.monotonic() + timeout_seconds
    last: Optional[dict] = None
    while time.monotonic() < deadline:
        try:
            last = _http_get_json(health_url, timeout_seconds=2.0)
            if _services_healthy(last):
                return True, last
        except Exception:
            last = None
        time.sleep(poll_interval)
    return False, last


def _run_seed(env: dict) -> int:
    seed_path = Path.cwd() / ".docker" / "seed_dynamodb.py"
    if not seed_path.exists():
        return 0  # nothing to seed; treat as success
    proc = subprocess.run(
        ["python3", str(seed_path)],
        env={**os.environ, **env},
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        emit_error("local up", f"seed failed: {proc.stderr.strip()}", "")
    return proc.returncode


@local_app.command("up", help="Bring up LocalStack and seed the table.")
def up_command(
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
    timeout: int = typer.Option(30, "--timeout", help="Health-check timeout in seconds."),
    skip_seed: bool = typer.Option(False, "--skip-seed", help="Do not run the seed script."),
    health_url: str = typer.Option(DEFAULT_HEALTH_URL, "--health-url", hidden=True),
) -> None:
    if json_output:
        set_json_mode(True)
    if not _docker_compose_available():
        err = UserFacingError(
            message="`docker` CLI not on PATH.",
            fix_hint="install Docker Desktop / Docker Engine and re-run.",
        )
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": err.message, "fix_hint": err.fix_hint}), err=True)
        else:
            emit_error("local up", err.message, err.fix_hint)
        raise typer.Exit(1)

    proc = subprocess.run(["docker", "compose", "up", "-d"], capture_output=True, text=True)
    if proc.returncode != 0:
        emit_error("local up", f"docker compose up failed: {proc.stderr.strip()}", "")
        raise typer.Exit(proc.returncode)

    ok, last = wait_for_healthy(health_url=health_url, timeout_seconds=timeout)
    if not ok:
        msg = (
            f"LocalStack health-check timed out after {timeout}s; "
            f"service status: {_json.dumps(last) if last is not None else 'no response'}"
        )
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": msg}), err=True)
        else:
            emit_error("local up", msg, "run `dx local down` then `dx local up` to retry.")
        raise typer.Exit(1)

    if not skip_seed:
        rc = _run_seed(env={"AWS_ACCESS_KEY_ID": "test", "AWS_SECRET_ACCESS_KEY": "test",
                            "AWS_REGION": "us-east-1", "AWS_DEFAULT_REGION": "us-east-1",
                            "AWS_ENDPOINT_URL": "http://localhost:4566"})
        if rc != 0:
            raise typer.Exit(rc)

    out = {"status": "healthy", "endpoint": "http://localhost:4566", "services": last.get("services") if last else {}}
    if json_output:
        typer.echo(_json.dumps(out, separators=(",", ":")))
    else:
        typer.echo(_json.dumps(out, indent=2))


@local_app.command("down", help="Tear down LocalStack containers + volumes.")
def down_command(
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
) -> None:
    if json_output:
        set_json_mode(True)
    if not _docker_compose_available():
        err = UserFacingError(message="`docker` CLI not on PATH.", fix_hint="install Docker.")
        if json_output:
            typer.echo(_json.dumps({"status": "error", "message": err.message}), err=True)
        else:
            emit_error("local down", err.message, err.fix_hint)
        raise typer.Exit(1)
    proc = subprocess.run(["docker", "compose", "down", "-v"], capture_output=True, text=True)
    out = {"stopped": proc.returncode == 0, "rc": proc.returncode}
    if json_output:
        typer.echo(_json.dumps(out, separators=(",", ":")))
    else:
        typer.echo(_json.dumps(out, indent=2))
    if proc.returncode != 0:
        raise typer.Exit(proc.returncode)
