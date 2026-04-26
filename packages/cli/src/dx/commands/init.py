"""`dx init` — scaffold .dx.yaml + PR template + pre-push hook.

Stack detection precedence (P0-6 audit fix):
  1. cdk.json + src/python/        → stack=python,     shape=lambda
  2. cdk.json + src/<go|clojure|typescript>/
                                   → stack=<lang>,     shape=lambda
  3. pyproject.toml at root (no cdk.json)
                                   → stack=python,     shape=wheel
  4. package.json at root (no cdk.json, no pyproject.toml)
                                   → stack=typescript, shape=wheel
                                     (we map "Node project" to the
                                      typescript adapter slot since the
                                      schema enum is python|go|clojure|
                                      typescript — there is no `node`)
  5. ambiguity → exit non-zero with actionable error pointing at
                 --stack and --service-shape flags

The Lambda-on-CDK pattern (1) wins over (4): Transactionify has all of
cdk.json + src/python/transactionify/ + package.json (the latter for CDK
TypeScript IaC deps), and the correct read is `python+lambda` — short-
circuiting on package.json would mis-detect.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import typer
from jinja2 import Environment, FileSystemLoader, select_autoescape

from dx.errors import UserFacingError
from dx.output import emit_error, emit_success, is_json_mode

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"


@dataclass
class DetectionResult:
    stack: str
    service_shape: str
    reason: str


def detect_stack(repo_root: Path) -> DetectionResult:
    cdk = (repo_root / "cdk.json").exists()
    pyproject = (repo_root / "pyproject.toml").exists()
    package_json = (repo_root / "package.json").exists()

    if cdk:
        for lang in ("python", "go", "clojure", "typescript"):
            if (repo_root / "src" / lang).is_dir():
                return DetectionResult(
                    stack=lang,
                    service_shape="lambda",
                    reason=f"cdk.json + src/{lang}/ (Lambda-on-CDK)",
                )

    # No cdk.json or cdk.json without a recognised src/<lang>/ subdir.
    if pyproject and package_json:
        raise UserFacingError(
            message="cannot disambiguate stack: both pyproject.toml and package.json present and no cdk.json + src/<lang>/ to break the tie.",
            fix_hint="declare via --stack and --service-shape flags (e.g. --stack python --service-shape wheel).",
            exit_code=2,
        )

    if pyproject:
        return DetectionResult(stack="python", service_shape="wheel", reason="pyproject.toml at root")
    if package_json:
        return DetectionResult(
            stack="typescript",
            service_shape="wheel",
            reason="package.json at root (mapped to typescript adapter slot)",
        )

    raise UserFacingError(
        message="cannot detect stack: no cdk.json + src/<lang>/, no pyproject.toml, no package.json found at repo root.",
        fix_hint="declare via --stack and --service-shape flags.",
        exit_code=2,
    )


def _render(template_name: str, **context: object) -> str:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(disabled_extensions=("j2",), default=False),
        keep_trailing_newline=True,
    )
    return env.get_template(template_name).render(**context)


def run_init(
    *,
    repo_root: Path,
    project: Optional[str] = None,
    stack: Optional[str] = None,
    service_shape: Optional[str] = None,
    force: bool = False,
    defaults: bool = False,
) -> dict:
    """Implementation. Returns a summary dict; raises UserFacingError on failure."""
    target_yaml = repo_root / ".dx.yaml"
    pr_template = repo_root / ".github" / "pull_request_template.md"
    hook_path = repo_root / ".git" / "hooks" / "pre-push"

    existing = [str(p.relative_to(repo_root)) for p in (target_yaml, pr_template, hook_path) if p.exists()]
    if existing and not force:
        raise UserFacingError(
            message=f"refusing to overwrite existing files: {', '.join(existing)}",
            fix_hint="re-run with --force to overwrite, or remove the files manually.",
            exit_code=1,
        )

    # Detect (or accept overrides).
    if not stack or not service_shape:
        det = detect_stack(repo_root)
        stack = stack or det.stack
        service_shape = service_shape or det.service_shape

    if not project:
        project = repo_root.name

    # Render and write.
    target_yaml.write_text(
        _render("dx-yaml.j2", project=project, stack=stack, service_shape=service_shape, test_root=None),
    )
    pr_template.parent.mkdir(parents=True, exist_ok=True)
    pr_template.write_text(_render("pr-template.md.j2"))
    hook_path.parent.mkdir(parents=True, exist_ok=True)
    hook_path.write_text(_render("pre-push.sh.j2"))
    hook_path.chmod(0o755)

    return {
        "created": [
            str(target_yaml.relative_to(repo_root)),
            str(pr_template.relative_to(repo_root)),
            str(hook_path.relative_to(repo_root)),
        ],
        "skipped": [],
        "stack": stack,
        "service_shape": service_shape,
        "project": project,
    }


def init_command(
    project: Optional[str] = typer.Option(None, "--project", help="Project name (defaults to repo dir name)."),
    stack: Optional[str] = typer.Option(None, "--stack", help="Override stack detection (python|go|clojure|typescript)."),
    service_shape: Optional[str] = typer.Option(
        None, "--service-shape", help="Override service_shape detection (lambda|wheel|binary)."
    ),
    force: bool = typer.Option(False, "--force", help="Overwrite existing files."),
    defaults: bool = typer.Option(False, "--defaults", help="Use detected defaults non-interactively."),
    json_output: bool = typer.Option(False, "--json", help="Emit structured JSON on stdout."),
) -> None:
    repo_root = Path.cwd()
    try:
        summary = run_init(
            repo_root=repo_root,
            project=project,
            stack=stack,
            service_shape=service_shape,
            force=force,
            defaults=defaults,
        )
    except UserFacingError as err:
        if json_output:
            import json as _json
            typer.echo(
                _json.dumps(
                    {"status": "error", "message": err.message, "fix_hint": err.fix_hint},
                    separators=(",", ":"),
                ),
                err=True,
            )
        else:
            emit_error("init", err.message, err.fix_hint)
        raise typer.Exit(err.exit_code)
    if json_output:
        import json as _json
        # Flat shape per GP-003 scenario "dx init --json emits a structured summary":
        # {"created": [...], "skipped": [...], "stack": ..., "service_shape": ..., "project": ...}.
        # Validation does `jq -e '.created | length == 3'`.
        typer.echo(_json.dumps(summary, separators=(",", ":")))
    else:
        emit_success("init", summary)
