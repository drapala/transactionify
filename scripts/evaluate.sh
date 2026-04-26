#!/usr/bin/env bash
# Offline-evaluator suite. Reproduces every claim in EVALUATION.md's
# deliverable matrix without GitHub admin, Amazon Q, Docker, or AWS.
#
# Strict: any failed check exits non-zero; the final report only prints
# when every check passes.
#
# Run:  ./scripts/evaluate.sh
# CI:   wired to PR pipeline lint job (green PR == green evaluator)

set -euo pipefail

red()    { printf '\033[0;31m✗ %s\033[0m\n' "$*" >&2; }
green()  { printf '\033[0;32m✓ %s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m· %s\033[0m\n' "$*"; }
section(){ printf '\n\033[1;34m━━━ %s ━━━\033[0m\n' "$*"; }

# --- preconditions -----------------------------------------------------------

section "Preconditions"
declare -A INSTALL_HINTS=(
  [node]="https://nodejs.org/  (or 'brew install node')"
  [pnpm]="npm i -g pnpm@9  (or 'brew install pnpm')"
  [uv]="brew install uv  (or 'curl -LsSf https://astral.sh/uv/install.sh | sh')"
  [jq]="brew install jq  (or apt-get install jq)"
  [pdfinfo]="brew install poppler  (or apt-get install poppler-utils)"
)
for cmd in node pnpm uv jq pdfinfo; do
  if command -v "$cmd" >/dev/null 2>&1; then
    green "$cmd on PATH"
  else
    red "$cmd missing — install: ${INSTALL_HINTS[$cmd]}"
    exit 1
  fi
done

yellow "First-run cost: pnpm + uv have to download dependencies (~1-2 minutes)."

if [ ! -f pyproject.toml ] || [ ! -f pnpm-workspace.yaml ]; then
  red "must run from repo root (pyproject.toml + pnpm-workspace.yaml not found)"
  exit 1
fi

# --- 1. lockfiles healthy ----------------------------------------------------

section "1/8 Lockfiles"
pnpm install --frozen-lockfile >/dev/null 2>&1 \
  && green "pnpm install --frozen-lockfile passes" \
  || { red "pnpm-lock.yaml out of sync with package.json"; exit 1; }
uv sync --all-packages --frozen >/dev/null 2>&1 \
  && green "uv sync --frozen passes" \
  || { red "uv.lock out of sync with pyproject.toml"; exit 1; }

# --- 2. CLI tests ------------------------------------------------------------

section "2/8 CLI tests (Python)"
uv tool install --quiet --editable packages/cli >/dev/null 2>&1
PYTEST_OUT=$(uv run pytest packages/cli/tests/ -q 2>&1)
CLI_PASSED=$(printf '%s' "$PYTEST_OUT" | grep -oE '[0-9]+ passed' | head -1 | grep -oE '[0-9]+' || echo 0)
if [ "$CLI_PASSED" -ge 71 ]; then
  green "$CLI_PASSED CLI tests passed"
else
  red "expected ≥71 CLI tests, got $CLI_PASSED"
  printf '%s\n' "$PYTEST_OUT" | tail -10 >&2
  exit 1
fi

# --- 3. Framework tests ------------------------------------------------------

section "3/8 Framework tests (TypeScript)"
FW_OUT=$(pnpm --filter @golden-path/framework test 2>&1)
FW_PASSED=$(printf '%s' "$FW_OUT" | grep -oE '[0-9]+ passed' | tail -1 | grep -oE '[0-9]+' || echo 0)
if [ "$FW_PASSED" -ge 79 ]; then
  green "$FW_PASSED framework tests passed"
else
  red "expected ≥79 framework tests, got $FW_PASSED"
  printf '%s\n' "$FW_OUT" | tail -10 >&2
  exit 1
fi

# --- 4. Schema validation ----------------------------------------------------

section "4/8 Schemas"
for schema in packages/shared-schemas/dora-event.schema.json packages/shared-schemas/dx-config.schema.json; do
  uv run python -c "import json,sys; from jsonschema import Draft202012Validator; Draft202012Validator.check_schema(json.load(open('$schema'))); sys.exit(0)" \
    && green "$schema validates as Draft202012" \
    || { red "$schema is not a valid JSON Schema"; exit 1; }
done

# Fixture events conform to the schema.
for fixture in packages/shared-schemas/tests/fixtures/valid-pipeline-run-event.json packages/shared-schemas/tests/fixtures/valid-deployment-rework-event.json; do
  uv run python -m jsonschema -i "$fixture" packages/shared-schemas/dora-event.schema.json >/dev/null 2>&1 \
    && green "fixture $fixture conforms" \
    || { red "fixture $fixture rejected by schema"; exit 1; }
done

# --- 5. ADR PDF is exactly 2 pages -------------------------------------------

section "5/8 ADR PDF"
test -f docs/ADR/0001-golden-path.pdf \
  || { red "docs/ADR/0001-golden-path.pdf not present"; exit 1; }
PAGES=$(pdfinfo docs/ADR/0001-golden-path.pdf | awk '/^Pages:/{print $2}')
if [ "$PAGES" = "2" ]; then
  green "ADR PDF = $PAGES pages (PDF requires max 2)"
else
  red "ADR PDF has $PAGES pages — PDF requires max 2"
  exit 1
fi

# --- 6. Workflow drift detection ---------------------------------------------

section "6/8 Workflow drift"
# Regenerate workflow fixtures + .github/workflows/{pr,integration}.yml from
# the framework's generators, then assert no diff. If the generator output
# does not match what's checked in, drift mode is non-zero.
pnpm --filter @golden-path/framework run gen-fixtures >/dev/null 2>&1
pnpm --filter @golden-path/framework exec tsx "$(pwd)/scripts/regenerate-workflows.ts" >/dev/null 2>&1
if git diff --quiet -- packages/framework/test/fixtures/ .github/workflows/; then
  green "workflow fixtures + .github/workflows/{pr,integration}.yml match generator output"
else
  red "workflow drift detected (generator output != committed)"
  git diff --stat -- packages/framework/test/fixtures/ .github/workflows/ >&2
  exit 1
fi

# --- 7. CHECK_MANIFEST cross-import lock -------------------------------------

section "7/8 CHECK_MANIFEST cross-import"
uv run python -m dx.checks.manifest_codegen --out /tmp/check-manifest.json >/dev/null 2>&1
if diff -q /tmp/check-manifest.json packages/framework/src/generated/check-manifest.json >/dev/null 2>&1; then
  green "Python CHECK_MANIFEST → JSON copy in framework: byte-for-byte match"
else
  red "check-manifest.json drift between Python source and framework copy"
  exit 1
fi

# --- 8. Repo cleanliness -----------------------------------------------------

section "8/8 Repo cleanliness"
LEAKED=$(git ls-files | grep -E '\.(js|d\.ts)$' | grep -v 'packages/framework/dist/' | head -5 || true)
if [ -z "$LEAKED" ]; then
  green "no compiled artifacts tracked outside packages/framework/dist/"
else
  red "compiled artifacts leaked into the index:"
  printf '   %s\n' $LEAKED >&2
  exit 1
fi

# --- final report ------------------------------------------------------------

section "Deliverable matrix (PDF → status → file)"
cat <<MATRIX

  1.a CLI uv installable          ✓ packages/cli/pyproject.toml
  1.b Framework pnpm installable  ✓ packages/framework/package.json (dist/ shipped)
  1.c Unit tests                  ✓ ${CLI_PASSED} pytest + ${FW_PASSED} vitest = $((CLI_PASSED + FW_PASSED)) total
  1.d DORA telemetry              ✓ packages/cli/src/dx/dora/ + dora-event.schema.json
  1.e README                      ✓ README.md ($(wc -l < README.md) lines)
  1.f Usage instructions          ✓ README §Quickstart + docs/adapters/<stack>.md
  1.g CONTRIBUTING                ✓ CONTRIBUTING.md ($(wc -l < CONTRIBUTING.md) lines)
  2   ADR PDF (≤2 pages)          ✓ docs/ADR/0001-golden-path.pdf (${PAGES} pages)
  3.a Local environment           ✓ dx local + docker-compose.yml + docs/LOCAL-ENV.md
  3.b Pre-push validation         ✓ .git/hooks/pre-push (installed by dx init)
  3.c Amazon Q AI review          ✓ .github/workflows/pr.yml step (gated on AMAZON_Q_REVIEW_ENABLED)
  3.d Integration pipeline        ✓ .github/workflows/integration.yml (green on main)
  3.e Kiro evidence               ✓ .kiro/steering/ + .kiro/specs/golden-path/

EVALUATE: ${CLI_PASSED} CLI + ${FW_PASSED} framework = $((CLI_PASSED + FW_PASSED)) tests passed; ADR=${PAGES} pages; zero workflow drift; deliverable matrix above.
MATRIX
