"""Emit CHECK_MANIFEST as deterministic JSON for the framework's static import.

Output guarantees (asserted by tests):
  - sort_keys=True, indent=2 → stable diffs
  - idempotent (running twice produces identical bytes)
  - shape mirrors the Python dict 1:1; regex strings are passed through verbatim

Usage:
    python -m dx.checks.manifest_codegen --out path/to/check-manifest.json
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dx.checks.manifest import CHECK_MANIFEST


def serialize(manifest: dict) -> str:
    """Serialize with stable formatting + trailing newline."""
    return json.dumps(manifest, sort_keys=True, indent=2) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="dx.checks.manifest_codegen")
    parser.add_argument("--out", required=True, help="Output JSON path.")
    args = parser.parse_args(argv)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(serialize(CHECK_MANIFEST))
    return 0


if __name__ == "__main__":
    sys.exit(main())
