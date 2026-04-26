"""Validate a YAML file against a JSON schema.

The `python -m jsonschema` CLI does NOT understand YAML — it expects JSON.
This module loads YAML and validates against a JSON schema using
jsonschema.Draft202012Validator. Reused by GP-004's contract check.

Usage (CLI form):
    python -m dx._yaml_validate <yaml-file> <schema-file>

Exits 0 on valid; 1 on invalid (with the first error printed to stderr);
2 on argument / file errors.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import yaml
from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError


def validate_yaml_against_schema(yaml_path: Path, schema_path: Path) -> tuple[bool, str]:
    """Return (ok, message). message is empty string on success."""
    if not yaml_path.exists():
        return False, f"yaml file not found: {yaml_path}"
    if not schema_path.exists():
        return False, f"schema file not found: {schema_path}"

    try:
        data: Any = yaml.safe_load(yaml_path.read_text())
    except yaml.YAMLError as e:
        return False, f"yaml parse error: {e}"

    try:
        schema = json.loads(schema_path.read_text())
    except json.JSONDecodeError as e:
        return False, f"schema parse error: {e}"

    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if not errors:
        return True, ""
    return False, _format_errors(errors)


def _format_errors(errors: list[ValidationError]) -> str:
    lines = []
    for err in errors:
        path = ".".join(str(p) for p in err.path) or "<root>"
        lines.append(f"  - at {path}: {err.message}")
    return "\n".join(lines)


def main() -> int:
    if len(sys.argv) != 3:
        print(f"usage: python -m dx._yaml_validate <yaml-file> <schema-file>", file=sys.stderr)
        return 2
    ok, message = validate_yaml_against_schema(Path(sys.argv[1]), Path(sys.argv[2]))
    if not ok:
        print(message, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
