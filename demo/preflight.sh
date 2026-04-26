#!/usr/bin/env bash
# Preflight — verify every demo precondition. Exit non-zero on any miss
# so the audience never sees a mid-act failure.
set -euo pipefail

red()   { printf '\033[0;31m✗ %s\033[0m\n' "$*" >&2; }
green() { printf '\033[0;32m✓ %s\033[0m\n' "$*"; }

failures=0

check_cmd() {
  local cmd="$1"; local hint="$2"
  if command -v "$cmd" >/dev/null 2>&1; then
    green "$cmd on PATH"
  else
    red "$cmd missing — $hint"
    failures=$((failures + 1))
  fi
}

check_cmd dx       "uv tool install --from git+... dx"
check_cmd uv       "brew install uv"
check_cmd pnpm     "brew install pnpm"
check_cmd gh       "brew install gh"
check_cmd jq       "brew install jq"
check_cmd actionlint "brew install actionlint"
check_cmd docker   "install Docker Desktop"
check_cmd aws      "brew install awscli"
check_cmd pdfinfo  "brew install poppler"

if gh auth status >/dev/null 2>&1; then green "gh authed"; else red "gh not authed — run: gh auth login"; failures=$((failures + 1)); fi
if docker info >/dev/null 2>&1; then green "docker daemon up"; else red "docker daemon not reachable"; failures=$((failures + 1)); fi

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"
case "$ORIGIN_URL" in
  *rrgarciach/transactionify*) red "origin is upstream rrgarciach/transactionify — must be a candidate-controlled fork"; failures=$((failures + 1));;
  "") red "no origin remote configured"; failures=$((failures + 1));;
  *) green "origin is candidate fork: $ORIGIN_URL";;
esac

REPO="$(echo "$ORIGIN_URL" | sed -E 's#.*[:/]([^/]+/[^/]+)(\.git)?$#\1#' | sed 's/\.git$//')"
if [ -n "${REPO:-}" ] && gh api "/repos/$REPO" --jq '.permissions.admin' 2>/dev/null | grep -qE 'true'; then
  green "admin permission on $REPO"
else
  red "current gh user lacks admin permission on $REPO"
  failures=$((failures + 1))
fi

DEFAULT_BRANCH="$(gh api "/repos/$REPO" --jq '.default_branch' 2>/dev/null)"
if [ "$DEFAULT_BRANCH" = "main" ]; then green "default branch is main"; else red "default branch is '$DEFAULT_BRANCH', must be 'main'"; failures=$((failures + 1)); fi

OWNER="${REPO%%/*}"
OWNER_KIND="$(gh api "/users/$OWNER" --jq '.type' 2>/dev/null)"
if [ "$OWNER_KIND" = "Organization" ]; then ENDPOINT="/orgs/$OWNER/installations"; else ENDPOINT="/user/installations"; fi
if gh api "$ENDPOINT" --jq '.installations[].app_slug' 2>/dev/null | grep -qE 'amazon-q'; then
  green "Amazon Q App installed on $OWNER"
else
  red "Amazon Q App not installed (ai-review will no-op). Install: https://github.com/apps/amazon-q-developer"
  failures=$((failures + 1))
fi

Q_VAR="$(gh variable list --repo "$REPO" --json name,value 2>/dev/null | jq -r '.[] | select(.name=="AMAZON_Q_REVIEW_ENABLED") | .value')"
if [ "$Q_VAR" = "true" ]; then
  green "AMAZON_Q_REVIEW_ENABLED=true on $REPO"
else
  red "AMAZON_Q_REVIEW_ENABLED is '${Q_VAR:-<unset>}'; set: gh variable set AMAZON_Q_REVIEW_ENABLED --repo $REPO --body true"
  failures=$((failures + 1))
fi

if [ "$failures" -ne 0 ]; then
  red "preflight: $failures issue(s). Fix before demo."
  exit 1
fi
green "preflight: all checks passed."
