"""AST-based enforcement: dx branch and dx pr import work_id patterns from
CHECK_MANIFEST and never re-inline them.

A string-grep test would pass under dynamic regex construction
(e.g. `'^' + chr(40) + 'LL'...`). AST parsing inspects the actual literals
the source file declares, so the assertion is robust to those games.
"""
from __future__ import annotations

import ast
import re
from pathlib import Path

import pytest


SRC_ROOT = Path(__file__).resolve().parent.parent / "src" / "dx"
TARGETS = [SRC_ROOT / "commands" / "branch.py", SRC_ROOT / "commands" / "pr.py"]

# Heuristics for "this string is a work_id-shaped regex literal"
_WORKID_REGEX_HINTS = [
    re.compile(r"\^?\(?LL\|GP\)?-"),  # ^(LL|GP)-
    re.compile(r"\(LL\|GP\)-\[0-9\]"),
    re.compile(r"\^\(LL\|GP\)-\[0-9\]\+\$"),
]


def _is_workid_literal(s: str) -> bool:
    return any(p.search(s) for p in _WORKID_REGEX_HINTS)


@pytest.mark.parametrize("path", TARGETS, ids=[p.name for p in TARGETS])
def test_imports_check_manifest(path: Path):
    tree = ast.parse(path.read_text())
    seen = False
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and (node.module or "").startswith("dx.checks.manifest"):
            names = [n.name for n in node.names]
            if "CHECK_MANIFEST" in names:
                seen = True
                break
    assert seen, f"{path.name} must import CHECK_MANIFEST from dx.checks.manifest"


@pytest.mark.parametrize("path", TARGETS, ids=[p.name for p in TARGETS])
def test_no_inline_workid_regex_literal(path: Path):
    """No string literal in this module may be a work_id-shaped regex.
    The pattern must come from CHECK_MANIFEST at runtime."""
    tree = ast.parse(path.read_text())
    offenders: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            if _is_workid_literal(node.value):
                offenders.append(f"  {path.name}:{node.lineno}: {node.value!r}")
    assert not offenders, "inlined work_id regex literal(s) found:\n" + "\n".join(offenders)


@pytest.mark.parametrize("path", TARGETS, ids=[p.name for p in TARGETS])
def test_no_re_compile_with_workid_literal(path: Path):
    """Catch dynamic construction: re.compile('^(LL|GP)-...$')."""
    tree = ast.parse(path.read_text())
    offenders: list[str] = []
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "re"
            and node.func.attr == "compile"
            and node.args
        ):
            arg = node.args[0]
            if isinstance(arg, ast.Constant) and isinstance(arg.value, str) and _is_workid_literal(arg.value):
                offenders.append(f"  {path.name}:{node.lineno}: re.compile({arg.value!r})")
    assert not offenders, "re.compile() with inline work_id literal(s):\n" + "\n".join(offenders)
