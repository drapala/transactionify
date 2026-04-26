#!/usr/bin/env bash
# Materialise a branched-repo fixture for `dx pr --dry-run` validation.
# Idempotent: running twice in the same dir is a no-op (rebuilds .git fresh).
set -euo pipefail
cd "$(dirname "$0")"
rm -rf .git a.txt
git init -b main -q
git config user.email "test@example.com"
git config user.name "test"
git commit --allow-empty -q -m "GP-0: initial"
git checkout -q -b GP-123-feat-add-validator
echo "fixture content" > a.txt
git add a.txt
git commit -q -m "GP-123: feat add validator"
git remote add origin git@github.com:test/branched-repo.git 2>/dev/null || true
