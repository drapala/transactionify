#!/usr/bin/env bash
# Workspace health check — verifies all base dev tooling is callable and pre-existing
# spec-first artifacts are intact. Called from GP-000 validation_commands and CI.
set -euo pipefail

red()   { printf '\033[0;31m%s\033[0m\n' "$*" >&2; }
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }

failures=0

# ---- helpers ------------------------------------------------------------------------------------

require_cmd() {
  local label="$1"; shift
  local install_hint="$1"; shift
  if ! command -v "$1" >/dev/null 2>&1; then
    red "MISSING: $label  (install: $install_hint)"
    failures=$((failures + 1))
  else
    green "OK: $label -> $(command -v "$1")"
  fi
}

require_node_bin() {
  local bin="$1"
  local install_hint="$2"
  if [ -x "node_modules/.bin/$bin" ]; then
    green "OK: $bin -> node_modules/.bin/$bin"
  elif command -v "$bin" >/dev/null 2>&1; then
    green "OK: $bin -> $(command -v "$bin")"
  else
    red "MISSING: $bin  (install: $install_hint)"
    failures=$((failures + 1))
  fi
}

require_python_module() {
  local mod="$1"
  local install_hint="$2"
  if uv run --no-sync python -c "import ${mod}" >/dev/null 2>&1 \
     || python3 -c "import ${mod}" >/dev/null 2>&1; then
    green "OK: python module ${mod}"
  else
    red "MISSING: python module ${mod}  (install: ${install_hint})"
    failures=$((failures + 1))
  fi
}

# ---- system tools (Homebrew on macOS / apt on Linux) --------------------------------------------

require_cmd "actionlint" "brew install actionlint" actionlint
require_cmd "pdfinfo (poppler-utils)" "brew install poppler" pdfinfo
require_cmd "jq" "brew install jq" jq
require_cmd "pnpm" "npm i -g pnpm@9 || brew install pnpm" pnpm
require_cmd "uv" "brew install uv" uv

# ---- node-tier dev tooling (root devDependencies) ----------------------------------------------

require_node_bin prettier   "pnpm install (root devDep)"
require_node_bin tsc        "pnpm install (typescript root devDep)"
require_node_bin vitest     "pnpm install (root devDep)"

# ---- python-tier dev tooling -------------------------------------------------------------------

require_cmd "ruff"   "uv sync"   ruff
require_cmd "pytest" "uv sync"   pytest
require_python_module "jsonschema" "uv sync"

# ---- pre-existing spec-first artifacts ---------------------------------------------------------

for f in \
  .kiro/steering/golden-path.md \
  .kiro/specs/golden-path/requirements.md \
  .kiro/specs/golden-path/design.md \
  .kiro/specs/golden-path/tasks.md \
  golden-path-tickets/README.md \
  docs/ADR/template.md \
  docs/ADR/0002-rfc-process.md \
  docs/RFC-template.md \
  catalog-info.yaml \
  docs/api/transactionify.bru \
  docs/api/README.md \
  ; do
  if [ -f "$f" ]; then
    green "OK: pre-existing $f"
  else
    red "MISSING pre-existing artifact: $f (provenance broken — do NOT recreate; restore from git)"
    failures=$((failures + 1))
  fi
done

# ---- summary -----------------------------------------------------------------------------------

if [ "$failures" -ne 0 ]; then
  red "FAIL: $failures workspace-health check(s) failed."
  exit 1
fi
green "PASS: all workspace-health checks passed."
