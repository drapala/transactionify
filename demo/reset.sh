#!/usr/bin/env bash
# Reset — for between demo takes.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "▎ tear down LocalStack"
dx local down --json 2>/dev/null | jq '.stopped' || true

echo "▎ delete demo branches"
git checkout main >/dev/null 2>&1 || true
for b in $(git branch --list 'GP-999-*' | sed 's/^[* ]*//'); do
  git branch -D "$b" 2>/dev/null || true
done
git branch -D feature/random 2>/dev/null || true

echo "▎ remove demo touch files"
rm -f demo-touch.txt /tmp/demo-touch.txt /tmp/dx-init.json /tmp/dx-governance.json

echo "▎ regenerate fixtures so .github/workflows/ matches the framework's current output"
pnpm --filter @golden-path/framework exec tsx scripts/regenerate-workflows.ts > /dev/null 2>&1 || true

echo "OK reset complete."
