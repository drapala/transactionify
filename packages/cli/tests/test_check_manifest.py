"""Tests for CHECK_MANIFEST shape and contents (the contract)."""
from __future__ import annotations

import re

import pytest

from dx.checks.manifest import CHECK_MANIFEST


REQUIRED_KEYS = {"lint", "unit_tests", "pbt", "contract", "work_id"}


def test_manifest_has_all_required_keys():
    assert REQUIRED_KEYS.issubset(set(CHECK_MANIFEST.keys()))


@pytest.mark.parametrize("name", ["lint", "unit_tests", "pbt", "contract"])
def test_command_check_shape(name):
    entry = CHECK_MANIFEST[name]
    assert entry["name"] == name
    assert isinstance(entry["cmd"], str) and entry["cmd"]
    assert isinstance(entry["args"], list)
    assert isinstance(entry["exit_codes_passing"], list)
    assert all(isinstance(c, int) for c in entry["exit_codes_passing"])


def test_pbt_is_distinct_from_unit_tests():
    """PDF lists Unit Tests, PBT, and API Contract as three deliverables."""
    assert CHECK_MANIFEST["pbt"]["args"] != CHECK_MANIFEST["unit_tests"]["args"]
    assert "pbt" in CHECK_MANIFEST["pbt"]["args"]
    assert "not pbt" in " ".join(CHECK_MANIFEST["unit_tests"]["args"])


def test_work_id_exposes_three_patterns():
    wid = CHECK_MANIFEST["work_id"]
    for key in ("extract_pattern", "branch_pattern", "subject_pattern"):
        assert key in wid
        # Each must compile as a regex.
        re.compile(wid[key])


def test_branch_pattern_matches_canonical_examples():
    bp = CHECK_MANIFEST["work_id"]["branch_pattern"]
    assert re.match(bp, "GP-123-feat-add-validator")
    assert re.match(bp, "LL-7-fix-typo")
    assert not re.match(bp, "GP-123_feat")  # underscore disallowed
    assert not re.match(bp, "feat/GP-123")  # leading prefix disallowed


def test_subject_pattern_matches_canonical_examples():
    sp = CHECK_MANIFEST["work_id"]["subject_pattern"]
    assert re.match(sp, "GP-123: feat add validator")
    assert re.match(sp, "LL-1: fix")
    assert not re.match(sp, "[GP-123] feat add validator")  # bracketed prefix disallowed
    assert not re.match(sp, "feat: GP-123 add validator")
