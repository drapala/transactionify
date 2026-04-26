"""Tests for `dx init` — stack detection precedence + scaffold behavior."""
from __future__ import annotations

import os
import stat
from pathlib import Path

import pytest

from dx.commands.init import detect_stack, run_init
from dx.errors import UserFacingError


def _git_init(path: Path) -> None:
    """Initialise a bare-bones .git/hooks dir without invoking git (test isolation)."""
    (path / ".git" / "hooks").mkdir(parents=True, exist_ok=True)


def test_detect_lambda_python_when_cdk_and_src_python(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "cdk.json").write_text("{}")
    (tmp_path / "package.json").write_text("{}")  # red herring (CDK IaC deps)
    (tmp_path / "src" / "python" / "myservice").mkdir(parents=True)
    det = detect_stack(tmp_path)
    assert det.stack == "python"
    assert det.service_shape == "lambda"


def test_detect_pyproject_only_yields_python_wheel(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    det = detect_stack(tmp_path)
    assert det.stack == "python"
    assert det.service_shape == "wheel"


def test_detect_package_json_only_maps_to_typescript_wheel(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "package.json").write_text("{}")
    det = detect_stack(tmp_path)
    assert det.stack == "typescript"
    assert det.service_shape == "wheel"


def test_detect_ambiguous_pyproject_and_package_json_fails(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    (tmp_path / "package.json").write_text("{}")
    with pytest.raises(UserFacingError) as exc:
        detect_stack(tmp_path)
    assert "--stack" in exc.value.fix_hint or "--service-shape" in exc.value.fix_hint


def test_detect_no_signals_fails(tmp_path):
    _git_init(tmp_path)
    with pytest.raises(UserFacingError):
        detect_stack(tmp_path)


def test_run_init_creates_three_files_and_marks_hook_executable(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    summary = run_init(repo_root=tmp_path)
    assert len(summary["created"]) == 3
    assert (tmp_path / ".dx.yaml").exists()
    assert (tmp_path / ".github" / "pull_request_template.md").exists()
    hook = tmp_path / ".git" / "hooks" / "pre-push"
    assert hook.exists()
    mode = hook.stat().st_mode
    assert mode & stat.S_IXUSR


def test_run_init_refuses_overwrite_without_force(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    run_init(repo_root=tmp_path)
    with pytest.raises(UserFacingError) as exc:
        run_init(repo_root=tmp_path)
    assert "force" in exc.value.fix_hint.lower()


def test_run_init_overwrites_with_force(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    run_init(repo_root=tmp_path)
    summary = run_init(repo_root=tmp_path, force=True)
    assert len(summary["created"]) == 3


def test_pre_push_hook_invokes_work_id_and_lint(tmp_path):
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    run_init(repo_root=tmp_path)
    hook_text = (tmp_path / ".git" / "hooks" / "pre-push").read_text()
    assert "dx check work_id" in hook_text
    assert "dx check lint" in hook_text


def test_generated_dx_yaml_validates_against_schema(tmp_path):
    """Schema-level smoke. Reads the real shared-schemas JSON from repo root."""
    _git_init(tmp_path)
    (tmp_path / "pyproject.toml").write_text("[project]\nname = 'x'\n")
    run_init(repo_root=tmp_path)
    # Locate repo root (3 parents up from this test file).
    repo_root = Path(__file__).resolve().parents[3]
    schema_path = repo_root / "packages" / "shared-schemas" / "dx-config.schema.json"
    assert schema_path.exists(), "shared-schemas not found; run after GP-001"

    from dx._yaml_validate import validate_yaml_against_schema
    ok, msg = validate_yaml_against_schema(tmp_path / ".dx.yaml", schema_path)
    assert ok, f"generated .dx.yaml failed schema validation: {msg}"
