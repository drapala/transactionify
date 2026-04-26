#!/usr/bin/env bash
# pre-dispatch-check.sh — verify the fork is ready for the Golden Path PoC dispatcher.
#
# Runs the 6 prereq groups documented in the audit-trail. Each check is independent
# and prints PASS/FAIL/WARN. Exit code is non-zero if any FAIL. Run from the fork root.
#
# Usage:
#   ./scripts/pre-dispatch-check.sh                    # auto-detect repo from origin
#   ./scripts/pre-dispatch-check.sh --repo owner/name  # override
#   ./scripts/pre-dispatch-check.sh --skip-tooling     # skip local-tooling checks
#
# Exit codes:
#   0  all PASS (or only WARN). Dispatcher safe to start.
#   1  one or more FAIL. Fix and re-run before dispatching.

set -u  # catch unbound vars; do NOT set -e (we want all checks to run)

REPO_OVERRIDE=""
SKIP_TOOLING=0
Q_ATTESTED=0
while [ $# -gt 0 ]; do
  case "$1" in
    --repo)         REPO_OVERRIDE="$2"; shift 2 ;;
    --skip-tooling) SKIP_TOOLING=1; shift ;;
    --q-attested)   Q_ATTESTED=1; shift ;;
    -h|--help)
      sed -n '2,15p' "$0" | sed 's/^# //; s/^#//'
      exit 0
      ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

# --- output helpers ---------------------------------------------------------
if [ -t 1 ]; then
  R=$'\033[31m'; G=$'\033[32m'; Y=$'\033[33m'; B=$'\033[1m'; X=$'\033[0m'
else
  R=""; G=""; Y=""; B=""; X=""
fi

FAILS=0
WARNS=0
PASSES=0
section() { printf "\n${B}== %s ==${X}\n" "$1"; }
pass()    { printf "  ${G}✓${X} %s\n" "$1"; PASSES=$((PASSES+1)); }
warn()    { printf "  ${Y}⚠${X} %s\n" "$1"; WARNS=$((WARNS+1)); }
fail()    { printf "  ${R}✗${X} %s\n" "$1"; FAILS=$((FAILS+1)); }
hint()    { printf "    ${B}fix:${X} %s\n" "$1"; }

# --- preconditions ----------------------------------------------------------
section "0. Preconditions"

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "")"
if [ -z "$REPO_ROOT" ]; then
  fail "not inside a git working tree"
  hint "cd into the fork repo and re-run"
  exit 1
fi
pass "git working tree at $REPO_ROOT"

cd "$REPO_ROOT"

# --- 1. Branch + remote -----------------------------------------------------
section "1. Branch + remote"

CURRENT_BRANCH="$(git branch --show-current 2>/dev/null)"
if [ "$CURRENT_BRANCH" = "main" ]; then
  pass "current branch is 'main'"
else
  fail "current branch is '$CURRENT_BRANCH', must be 'main'"
  hint "git branch -m '$CURRENT_BRANCH' main"
fi

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo "")"
case "$ORIGIN_URL" in
  "")
    fail "no 'origin' remote configured"
    hint "git remote add origin git@github.com:<your-fork>/transactionify.git"
    ;;
  *rrgarciach/transactionify*)
    fail "origin points to upstream (rrgarciach/transactionify) — must be your fork"
    hint "gh repo fork rrgarciach/transactionify --remote-name=upstream && git remote set-url origin git@github.com:<your-fork>/transactionify.git"
    ;;
  *)
    pass "origin: $ORIGIN_URL"
    ;;
esac

# Derive repo from origin (or use override)
if [ -n "$REPO_OVERRIDE" ]; then
  REPO="$REPO_OVERRIDE"
else
  REPO="$(echo "$ORIGIN_URL" | sed -E 's#.*[:/]([^/]+/[^/]+)(\.git)?$#\1#' | sed 's/\.git$//' 2>/dev/null)"
fi

if [ -n "$REPO" ] && [ "$REPO" != "rrgarciach/transactionify" ]; then
  pass "target repo: $REPO"
else
  fail "could not derive repo (got '$REPO')"
fi

# Check that origin/main is in sync with local main (warning, not fail)
if git ls-remote origin main >/dev/null 2>&1; then
  LOCAL_HEAD="$(git rev-parse main 2>/dev/null || echo "")"
  REMOTE_HEAD="$(git ls-remote origin main 2>/dev/null | awk '{print $1}')"
  if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
    pass "local main matches origin/main"
  elif [ -n "$REMOTE_HEAD" ]; then
    warn "local main and origin/main diverged"
    hint "git push origin main (or git pull --rebase)"
  else
    warn "origin has no 'main' branch yet"
    hint "git push -u origin main"
  fi
else
  warn "could not reach origin (network or auth issue)"
fi

# --- 2. Backlog ------------------------------------------------------------
section "2. Backlog (specs + tickets)"

TICKETS=$(ls golden-path-tickets/GP-*.yaml 2>/dev/null | wc -l | tr -d ' ')
if [ "$TICKETS" = "15" ]; then
  pass "15 active tickets in ./golden-path-tickets/"
else
  fail "expected 15 ticket YAMLs, found $TICKETS"
fi

for spec in .kiro/steering/golden-path.md \
            .kiro/specs/golden-path/requirements.md \
            .kiro/specs/golden-path/design.md \
            .kiro/specs/golden-path/tasks.md \
            golden-path-tickets/README.md \
            golden-path-tickets/NOTE.md \
            docs/ADR/template.md \
            docs/ADR/0002-rfc-process.md \
            docs/RFC-template.md \
            catalog-info.yaml \
            docs/api/transactionify.bru \
            docs/audit-trail.md; do
  if [ -f "$spec" ]; then
    pass "$spec"
  else
    fail "missing: $spec"
  fi
done

# Sync between Downloads mirror and fork
DL_DIR="$HOME/Downloads/golden-path-tickets"
if [ -d "$DL_DIR" ]; then
  DIVERGED=0
  for f in golden-path-tickets/GP-*.yaml; do
    base="$(basename "$f")"
    if [ -f "$DL_DIR/$base" ]; then
      if ! diff -q "$f" "$DL_DIR/$base" >/dev/null 2>&1; then
        DIVERGED=$((DIVERGED+1))
      fi
    fi
  done
  if [ "$DIVERGED" -eq 0 ]; then
    pass "tickets in sync with $DL_DIR"
  else
    warn "$DIVERGED ticket(s) differ from Downloads mirror"
    hint "cp golden-path-tickets/*.yaml $DL_DIR/  # if fork is canonical"
  fi
else
  warn "no Downloads mirror at $DL_DIR (acceptable if dispatcher reads from fork)"
fi

# Spec-first chronology — Kiro foundation must be the candidate's first commit after upstream
UPSTREAM_HEAD="$(git log --format='%H' upstream/master 2>/dev/null | head -1 || git rev-list --max-parents=0 HEAD | tail -1)"
FIRST_CANDIDATE="$(git log --format='%H' --reverse "${UPSTREAM_HEAD}..HEAD" 2>/dev/null | head -1)"
KIRO_COMMIT="$(git log --format='%H' --diff-filter=A -- .kiro/specs/golden-path/requirements.md 2>/dev/null | head -1)"
if [ -n "$KIRO_COMMIT" ] && [ -n "$FIRST_CANDIDATE" ]; then
  # Kiro must land within the first 2 candidate commits (gitignore commit may precede it)
  CANDIDATE_FIRST_TWO="$(git log --format='%H' --reverse "${UPSTREAM_HEAD}..HEAD" 2>/dev/null | head -2)"
  if echo "$CANDIDATE_FIRST_TWO" | grep -qF "$KIRO_COMMIT"; then
    pass "spec-first chronology: Kiro foundation lands among the first candidate commits"
  else
    warn "Kiro foundation lands AFTER other candidate commits — provenance may be unclear"
  fi
else
  warn "could not verify Kiro foundation chronology"
fi

# --- 3. GitHub auth + permissions ------------------------------------------
section "3. GitHub auth + permissions on $REPO"

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    pass "gh auth status"
  else
    fail "gh not authenticated"
    hint "gh auth login --hostname github.com -p https -w"
  fi

  ADMIN="$(gh api "/repos/$REPO" --jq '.permissions.admin' 2>/dev/null)"
  if [ "$ADMIN" = "true" ]; then
    pass "admin permission on $REPO"
  else
    fail "no admin permission on $REPO (got: '${ADMIN:-error}')"
    hint "verify the auth user owns or has admin access to the fork"
  fi

  DEFAULT_BRANCH="$(gh api "/repos/$REPO" --jq '.default_branch' 2>/dev/null || echo "")"
  if [ "$DEFAULT_BRANCH" = "main" ]; then
    pass "default branch on $REPO is 'main'"
  else
    fail "default branch is '$DEFAULT_BRANCH', must be 'main'"
    hint "gh api -X PATCH /repos/$REPO -f default_branch=main"
  fi
else
  fail "gh CLI not installed"
  hint "brew install gh"
fi

# --- 4. Amazon Q App + variable --------------------------------------------
section "4. Amazon Q Developer App on $REPO"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  OWNER="${REPO%%/*}"
  OWNER_KIND="$(gh api "/users/$OWNER" --jq '.type' 2>/dev/null || echo "")"
  case "$OWNER_KIND" in
    Organization) Q_ENDPOINT="/orgs/$OWNER/installations" ;;
    User)
      AUTH_LOGIN="$(gh api /user --jq '.login' 2>/dev/null || echo "")"
      if [ "$AUTH_LOGIN" = "$OWNER" ]; then
        Q_ENDPOINT="/user/installations"
      else
        Q_ENDPOINT=""
        fail "auth user ($AUTH_LOGIN) is not the fork owner ($OWNER)"
        hint "gh auth login -u $OWNER (only the auth user can list their own App installations)"
      fi
      ;;
    *)
      Q_ENDPOINT=""
      fail "could not determine owner type for '$OWNER'"
      ;;
  esac

  if [ -n "$Q_ENDPOINT" ]; then
    Q_API_OUT="$(gh api "$Q_ENDPOINT" 2>&1)"
    Q_API_RC=$?
    if [ $Q_API_RC -eq 0 ] && echo "$Q_API_OUT" | jq -r '.installations[].app_slug' 2>/dev/null | grep -q amazon-q; then
      pass "Amazon Q App installed at $Q_ENDPOINT"

      # Repo-level access check for installations scoped to "selected"
      Q_ID="$(echo "$Q_API_OUT" | jq -r '.installations[] | select(.app_slug | contains("amazon-q")) | .id' 2>/dev/null)"
      Q_SELECTION="$(echo "$Q_API_OUT" | jq -r ".installations[] | select(.id==$Q_ID) | .repository_selection" 2>/dev/null)"
      if [ "$Q_SELECTION" = "all" ]; then
        pass "Q App scope: all repositories (covers $REPO)"
      elif [ "$Q_SELECTION" = "selected" ]; then
        if gh api "/user/installations/$Q_ID/repositories" --jq '.repositories[].full_name' 2>/dev/null | grep -qxF "$REPO"; then
          pass "Q App granted access to $REPO (scoped install)"
        else
          fail "Q App is installed but not granted access to $REPO"
          hint "open https://github.com/settings/installations/$Q_ID and select $REPO"
        fi
      else
        warn "Q App repository_selection: '$Q_SELECTION' (unknown)"
      fi
    elif echo "$Q_API_OUT" | grep -q 'authorized to a GitHub App'; then
      # Personal access tokens can't list /user/installations — only App-issued tokens can.
      # This is a GitHub API limitation, not a missing install. Trust the user with --q-attested.
      if [ "$Q_ATTESTED" -eq 1 ]; then
        pass "Amazon Q App: user-attested (--q-attested; API can't verify with PAT)"
      else
        warn "cannot verify Q App via API (PAT scope insufficient — needs App OAuth flow)"
        hint "verify manually at https://github.com/settings/installations and re-run with --q-attested"
      fi
    else
      fail "Amazon Q Developer App not installed on $OWNER"
      hint "open https://github.com/apps/amazon-q-developer/installations/new"
    fi
  fi

  # AMAZON_Q_REVIEW_ENABLED variable
  Q_VAR="$(gh variable list --repo "$REPO" --json name,value 2>/dev/null | \
           jq -r '.[] | select(.name=="AMAZON_Q_REVIEW_ENABLED") | .value' 2>/dev/null)"
  if [ "$Q_VAR" = "true" ]; then
    pass "repo variable AMAZON_Q_REVIEW_ENABLED=true"
  else
    fail "repo variable AMAZON_Q_REVIEW_ENABLED is '${Q_VAR:-<unset>}', must be 'true'"
    hint "gh variable set AMAZON_Q_REVIEW_ENABLED --repo $REPO --body true"
  fi
else
  warn "skipped Q App checks (gh not available or not authenticated)"
fi

# --- 5. Local tooling ------------------------------------------------------
if [ "$SKIP_TOOLING" -eq 0 ]; then
  section "5. Local tooling"

  for tool in git gh jq yq uv pnpm docker pdfinfo actionlint shellcheck; do
    if command -v "$tool" >/dev/null 2>&1; then
      VERSION="$($tool --version 2>&1 | head -1 | tr -d '\n' | cut -c1-60)"
      pass "$tool ($VERSION)"
    else
      case "$tool" in
        actionlint|shellcheck) warn "$tool not installed (optional but recommended)"; hint "brew install $tool" ;;
        pdfinfo)               fail "pdfinfo missing — required for ADR page-count validation"; hint "brew install poppler" ;;
        pnpm)                  fail "pnpm missing — required for framework workspace + Git-direct install validation"; hint "brew install pnpm  (need >= 9)" ;;
        docker)                fail "docker missing — required for LocalStack (GP-009d)"; hint "open https://docs.docker.com/desktop/" ;;
        *)                     fail "$tool missing"; hint "brew install $tool" ;;
      esac
    fi
  done

  # pnpm version >= 9 (subdirectory install syntax)
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_MAJOR="$(pnpm --version 2>/dev/null | cut -d. -f1)"
    if [ -n "$PNPM_MAJOR" ] && [ "$PNPM_MAJOR" -ge 9 ] 2>/dev/null; then
      pass "pnpm major version >= 9"
    else
      fail "pnpm version $PNPM_MAJOR < 9 (Git-direct subdirectory install requires 9+)"
      hint "brew upgrade pnpm  OR  npm i -g pnpm@latest"
    fi
  fi

  # uuid_utils installable in the test venv (optional — fork uses fallback)
  if command -v uv >/dev/null 2>&1; then
    pass "uv available (project venv setup will work)"
  fi
else
  section "5. Local tooling [SKIPPED]"
fi

# --- 6. Working tree state -------------------------------------------------
section "6. Working tree state"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  pass "working tree clean"
else
  warn "working tree has uncommitted changes"
  git status -s | head -5 | sed 's/^/    /'
fi

# Untracked private dirs
if [ -d docs/superpowers ] && grep -q '^docs/superpowers' .gitignore 2>/dev/null; then
  pass "docs/superpowers/ exists and is gitignored (private scratchpad)"
elif [ -d docs/superpowers ]; then
  warn "docs/superpowers/ exists but is NOT gitignored — may leak into commits"
  hint "echo 'docs/superpowers/' >> .gitignore"
fi

# --- summary ---------------------------------------------------------------
printf "\n${B}== Summary ==${X}\n"
printf "  ${G}PASS:${X} %d   ${Y}WARN:${X} %d   ${R}FAIL:${X} %d\n" "$PASSES" "$WARNS" "$FAILS"

if [ "$FAILS" -gt 0 ]; then
  printf "\n${R}Dispatch NOT ready.${X} Fix the FAILs above and re-run.\n"
  exit 1
fi

if [ "$WARNS" -gt 0 ]; then
  printf "\n${Y}Dispatch ready with caveats.${X} Review the WARNs above. Open the fresh session if you accept them.\n"
else
  printf "\n${G}Dispatch ready.${X} Open the fresh session.\n"
fi
exit 0
