#!/usr/bin/env bash
# Act 2 — pre-push hook blocks the wrong path; dx pr opens the right one.
# Idempotent: re-run resets the demo branch to a clean state.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

DEMO_BRANCH=GP-999-feat-demo-recovery

echo "▎ reset demo state"
git checkout main >/dev/null 2>&1 || true
git branch -D "$DEMO_BRANCH" 2>/dev/null || true

echo "▎ wrong branch — pre-push would block"
git checkout -b feature/random >/dev/null 2>&1
echo "(narration: try push; pre-push hook fails with branch-pattern violation)"
dx check work_id --json 2>&1 | jq '.failures[0] // .results[]' || true
git checkout main >/dev/null 2>&1
git branch -D feature/random

echo "▎ right branch via dx branch"
dx branch GP-999 "feat: demo recovery" --json | jq '{branch_name, work_id, status}'

echo "▎ wrong commit subject — bracketed prefix rejected"
echo "demo $(date +%s)" > /tmp/demo-touch.txt
cp /tmp/demo-touch.txt demo-touch.txt
git add demo-touch.txt
git -c commit.gpgsign=false commit -m "[GP-999] feat thing" >/dev/null
dx check work_id --json 2>&1 | jq '.failures[0] // empty'

echo "▎ reword to right shape"
git -c commit.gpgsign=false commit --amend -m "GP-999: feat demo recovery" >/dev/null
dx check work_id --json 2>&1 | jq '.results[] | select(.name=="work_id") | {name, status}'

echo "▎ dx pr --dry-run (validates locally; does NOT call gh)"
dx pr --dry-run --json | jq '{title, work_id, validation}'

echo "▎ cleanup the demo touch file (keeps tree clean)"
git rm demo-touch.txt >/dev/null
git -c commit.gpgsign=false commit -m "GP-999: cleanup demo artifact" >/dev/null
echo "(demo: stop here for narration; in a live demo we'd \`dx pr\` to actually open the PR)"
