# Governance — what's enforced and why

> **Quick read:** the Golden Path platform's review and merge invariants are codified in a GitHub Ruleset (`golden-path-default`) applied via `dx governance apply`. This file documents what's enforced, what's deliberately *not* enforced, and what the evolution path looks like.

## What's enforced today

| Rule | Configuration | Source |
|---|---|---|
| Pull request required | 2 approving reviews; dismiss stale on push; CODEOWNERS approval required; thread resolution required | `pull_request` rule |
| Required status checks | Derived from the regenerated PR workflow — every blocking job (no `continue-on-error`, no `if: always()`) is a required context | `required_status_checks` rule |
| No branch deletion | Cannot delete `main` | `deletion` rule |
| No force push | Cannot rewrite history on `main` | `non_fast_forward` rule |

Required-status-checks list comes from `extractBlockingJobsFromWorkflow(.github/workflows/pr.yml)` — never hardcoded. When the workflow gains a new blocking job, regenerating the ruleset automatically protects that context. Drift mode: zero.

## What's deliberately NOT enforced (PoC)

| NOT enforced | Why |
|---|---|
| Signed commits (`required_signatures`) | Solo author has no GPG/SSH signing preconfigured; including this would block the demo merge AFTER two reviewers approve, invalidating the very enforcement being demonstrated. Documented as evolution path in the README §Roadmap. |
| Multi-environment rulesets (sandbox/staging/prod variants) | Single `main` ruleset is sufficient for the PoC; per-env rulesets are an N-orgs-and-up problem. |
| Drift detection (desired vs. applied state) | `dx governance apply` is idempotent; rerunning is the simple alternative. |
| CODEOWNERS auto-generation from history | Manual ownership is fine for a 3-package platform. |

## Evolution path

1. **Add signed commits** as opt-in via `.dx.yaml.governance.signed_commits=true`. The ruleset builder already supports this flag (`buildDefaultRuleset({ signedCommits: true })`).
2. **Per-environment rulesets** — sibling builders for `staging` and `production` deployment environments, applied via `dx governance apply --environment ...`.
3. **Two-step rollout** — ship new rules in `enforcement: "evaluate"` mode first, surface findings in CI, give teams a window, then promote to `active`.

## Operational

```bash
# Plan only — no network mutation.
dx governance apply --dry-run --json

# Apply (idempotent: list-by-name → POST or PUT by id).
dx governance apply --json

# Verify via gh CLI (admin scope required).
gh ruleset list --repo <owner>/<repo>
```

## Why a numeric id, not a name

GitHub addresses rulesets by numeric id, not name. `dx governance apply` lists existing rulesets, matches by `name == 'golden-path-default'`, and either POSTs (create) or PUTs by id (update). Earlier-draft `PUT /rulesets/{name}` returns 404 in production — the API has no such route.
