"""dx — Typer entry point.

Registers the seven command groups from the steering doc:
  init, check, branch, pr, governance, local, dora

Bodies for each group ship in their own GP-NNN tickets (init=GP-003,
check=GP-004, branch+pr=GP-002b, governance=GP-008, local=GP-009d,
dora=GP-013). This file owns ONLY the CLI shell, --json/--version flags,
and the stub bodies that print 'not yet implemented' — the bodies are
replaced by their respective tickets.

NOTE on `dx hooks`: pre-push hook installation is part of `dx init`. There
is NO `dx hooks` top-level group. The CLI surface is exactly seven groups;
adding an eighth here would diverge from the steering doc and the demo
narrative (Convention over Configuration: one mental model across all
contexts).
"""

from __future__ import annotations

from typing import Optional

import typer

from dx import __version__
from dx.errors import UserFacingError
from dx.output import emit_error, emit_success, set_json_mode

app = typer.Typer(
    name="dx",
    help="Developer CLI for the Golden Path platform (Typer + Rich; --json on every command).",
    no_args_is_help=True,
    add_completion=False,
)

# Sub-apps for each command group. Bodies are intentionally stubs at GP-002 time;
# their respective tickets replace `_stub` with real implementations.
from dx.commands.init import init_command  # noqa: E402

init_app = typer.Typer(help="Scaffold .dx.yaml + PR template + pre-push hook (GP-003).")
init_app.callback(invoke_without_command=True)(init_command)
from dx.commands import check as _check_module  # noqa: E402

check_app = typer.Typer(help="Run lint, unit, PBT, contract, work_id checks (GP-004).")
_check_module.register(check_app)
from dx.commands.branch import branch_command  # noqa: E402
from dx.commands.pr import pr_command  # noqa: E402

# branch and pr are registered as top-level commands (not sub-Typers) because
# they accept positional arguments. A sub-Typer with invoke_without_command=True
# + positional callback args makes Typer's help advertise an extra COMMAND slot
# and the runner mis-parses the args as missing.
from dx.commands.dora import dora_app  # noqa: E402

governance_app = typer.Typer(help="Apply the platform GitHub ruleset (GP-008).")
local_app = typer.Typer(help="LocalStack + seeded DynamoDB lifecycle (GP-009d).")

app.add_typer(init_app, name="init")
app.add_typer(check_app, name="check")
app.command(name="branch", help="Create a Work-ID-conformant branch (GP-002b).")(branch_command)
app.command(name="pr", help="Submit PR; validates branch + commits + title locally first (GP-002b).")(pr_command)
app.add_typer(governance_app, name="governance")
app.add_typer(local_app, name="local")
app.add_typer(dora_app, name="dora")


def _stub(group: str) -> None:
    raise UserFacingError(
        message=f"`dx {group}` is not yet implemented (GP-002 ships only the CLI shell).",
        fix_hint=f"See .kiro/specs/golden-path/tasks.md — the ticket implementing `{group}` is the one to dispatch next.",
        exit_code=2,
    )


@governance_app.callback(invoke_without_command=True)
def governance_root() -> None:
    _stub("governance")


@local_app.callback(invoke_without_command=True)
def local_root() -> None:
    _stub("local")


@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    json_output: bool = typer.Option(
        False,
        "--json",
        help="Emit structured JSON on stdout (one object per emission). Errors go to stdout in this mode.",
    ),
    version: bool = typer.Option(
        False,
        "--version",
        help="Print version and exit.",
    ),
) -> None:
    set_json_mode(json_output)
    if version:
        if json_output:
            # Per GP-002 scenario "dx --version returns a SemVer string":
            # with --json, stdout is exactly {"version": "x.y.z"} (flat object,
            # NOT the {command, status, duration_ms, payload} envelope used
            # for other commands). Validation command does `jq -e '.version'`.
            import json as _json
            typer.echo(_json.dumps({"version": __version__}, separators=(",", ":")))
        else:
            typer.echo(__version__)
        raise typer.Exit()
    if ctx.invoked_subcommand is None:
        # Mimic no_args_is_help: print help and exit 0.
        typer.echo(ctx.get_help())
        raise typer.Exit()


# Top-level error trap so UserFacingError flows through emit_error consistently.
def _run() -> None:
    try:
        app()
    except UserFacingError as err:
        emit_error("dx", err.message, err.fix_hint)
        raise typer.Exit(err.exit_code)


if __name__ == "__main__":
    _run()
