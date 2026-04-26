#!/usr/bin/env bash
# Delegates to a workspace package's npm script. Fails loud (exit 1) when the
# target package or script is missing — no silent no-op (GP-000 scenario 3).
set -euo pipefail

pkg="${1:?usage: run-workspace-script.sh <package-name> <script>}"
script="${2:?usage: run-workspace-script.sh <package-name> <script>}"

if ! pnpm --filter "$pkg" exec node -e 'process.exit(0)' >/dev/null 2>&1; then
  echo "ERROR: workspace package '$pkg' not found (cannot run '$script')." >&2
  echo "       Either the package has not been scaffolded yet, or the filter is wrong." >&2
  exit 1
fi

# pnpm --filter ... run <script> exits 0 silently when the script is absent.
# Pre-check package.json to fail loud when missing.
manifest=$(pnpm --filter "$pkg" exec node -e 'console.log(require("path").resolve("package.json"))')
if ! node -e "process.exit(require('$manifest').scripts && require('$manifest').scripts['$script'] ? 0 : 1)"; then
  echo "ERROR: package '$pkg' has no '$script' script in package.json." >&2
  exit 1
fi

exec pnpm --filter "$pkg" run "$script"
