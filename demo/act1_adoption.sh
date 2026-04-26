#!/usr/bin/env bash
# Act 1 — the platform applied to itself in 5 commands.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

REPO="$(git remote get-url origin | sed -E 's#.*[:/]([^/]+/[^/]+)(\.git)?$#\1#' | sed 's/\.git$//')"

echo "▎ 1/5  uv tool install dx (idempotent)"
uv tool install --editable packages/cli > /dev/null 2>&1

echo "▎ 2/5  pnpm framework already linked via workspace"
pnpm install > /dev/null 2>&1

echo "▎ 3/5  dx init (already present in this fork; re-run with --force for the demo)"
dx init --force --json | tee /tmp/dx-init.json | jq '.created'

echo "▎ 4/5  regenerate workflows from the framework generators"
pnpm --filter @golden-path/framework exec tsx /Users/drapala/projects/transactionify/scripts/regenerate-workflows.ts > /dev/null
ls .github/workflows/

echo "▎ 5/5  apply ruleset (idempotent: list → match by name → POST or PUT by id)"
dx governance apply --repo "$REPO" --json | tee /tmp/dx-governance.json | jq '{status, ruleset_id, target_repo}'

echo "▎ verify via gh api"
gh api "/repos/$REPO/rulesets" | jq '.[] | select(.name=="golden-path-default") | {id, name, enforcement, target}'
