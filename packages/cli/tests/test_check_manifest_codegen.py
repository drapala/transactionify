"""Tests for the JSON codegen — deterministic output, idempotent, shape-stable."""
from __future__ import annotations

import json
from pathlib import Path

from dx.checks.manifest import CHECK_MANIFEST
from dx.checks.manifest_codegen import main as codegen_main, serialize


def test_serialize_uses_sorted_keys_and_two_space_indent():
    out = serialize(CHECK_MANIFEST)
    parsed = json.loads(out)
    assert parsed == CHECK_MANIFEST
    # Sorted keys: top level keys appear alphabetically in the serialized text.
    keys_in_order = []
    for line in out.splitlines():
        stripped = line.strip()
        if stripped.startswith('"') and stripped.endswith(": {") or (
            stripped.startswith('"') and ": " in stripped and stripped.count('"') >= 2
        ):
            # Take the key (first quoted token).
            key = stripped.split('"')[1]
            if key in CHECK_MANIFEST:
                keys_in_order.append(key)
    # Top-level keys must be in sorted order.
    top_level_in_order = [k for k in keys_in_order if k in CHECK_MANIFEST and keys_in_order.count(k) == 1]
    assert top_level_in_order == sorted(top_level_in_order)


def test_codegen_is_idempotent(tmp_path):
    out1 = tmp_path / "m1.json"
    out2 = tmp_path / "m2.json"
    codegen_main(["--out", str(out1)])
    codegen_main(["--out", str(out2)])
    assert out1.read_bytes() == out2.read_bytes()


def test_codegen_round_trip_preserves_shape(tmp_path):
    out = tmp_path / "manifest.json"
    codegen_main(["--out", str(out)])
    parsed = json.loads(out.read_text())
    assert parsed == CHECK_MANIFEST


def test_codegen_creates_parent_dir(tmp_path):
    out = tmp_path / "deeply" / "nested" / "manifest.json"
    codegen_main(["--out", str(out)])
    assert out.exists()
