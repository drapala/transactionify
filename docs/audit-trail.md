# Pre-dispatch audit trail

> **Purpose.** This file consolidates the findings of three independent pre-dispatch audits run against the Golden Path PoC backlog. It exists as evidence of rigor — the kind of "we stress-tested this before submission" trail a reviewer can read once and not have to re-derive. It is intentionally separate from the ticket YAMLs so the operational artifacts read clean.

## Audit cadence

The backlog went through three independent passes before dispatch:

1. **First pass** — initial trim audit. Cut GP-011 (stretch `dx agents init`) and GP-012 (test-discipline check) after finding their load-bearing demo cases were false against the real fork. Discipline-check survives as an evolution-path bullet in the README §Roadmap.

2. **Second pass** — fresh-eyes audit with file-system access to the real Transactionify fork. Surfaced the broken-test class of P0s that pure-YAML readings cannot find.

3. **Third pass** — independent fresh-eyes audit (different model family) with the real repo. Surfaced repo-state issues (master vs main, origin pointing upstream) and pipeline correctness issues (workflow permissions, event_id requirement) that earlier passes missed.

## Findings by audit (chronological)

### Audit 1 — first pass (cuts)

- Archived **GP-011** (`dx agents init` stretch): out of critical path; carrying it would inflate scope without changing the demo. Lives in `~/Downloads/golden-path-tickets/archive/`.
- Archived **GP-012** (test-discipline check): the demo case (`@patch('query_by_pk')` on a "removed" symbol) was provably false against the real fork — `query_by_pk` still exists at `src/python/transactionify/tools/aws/dynamodb/__init__.py:70`. The discipline-check generality (`.dx.yaml.test_discipline.banned_patches`) survives only as a Roadmap bullet.

### Audit 2 — second pass (P0s)

| ID | Defect | Resolution |
|---|---|---|
| P0-1 | Fork's existing pytest suite broken in 4 ways: `@patch` targets stale after upstream pagination refactor (a0d9b5e), `pytest.ini` pythonpath wrong for inner imports, missing `__init__.py` in handler test dirs, boto3 NoRegionError at module-import. Without fixes, every blocking CI job is red. | GP-009a now owns the test fixes (rename patches, add `__init__.py`, fix pythonpath, set `AWS_DEFAULT_REGION` in workflow env). |
| P0-2 | (Retracted) `pdfinfo` validation suspected gameable. Verified empirically: without pdfinfo, exit code is 1 — fail-loud, not gameable. Downgraded to dev-tooling concern; pdfinfo added to GP-000 health check. | Resolved as P2. |
| P0-3 | GP-010 pnpm Git-direct install validation used a path resolving to `/Users/drapala/Downloads/golden-path-tickets/.git` (does not exist) AND swallowed every failure with `\|\| echo`. The "empirical install validation" was theatrical. | GP-010 validation rewritten using `git rev-parse --show-toplevel`, no `\|\| echo`. |
| P0-4 | Build attestation references the CDK-synth output bundle (`service-package.tgz`) but ticket prose claimed "this is what is actually deployed" — false; CDK deploys per-asset zips. | Wording fixed in GP-006. Per-asset attestation via `attest-build-provenance@v2` digest list documented in README §Roadmap. |
| P0-5 | GP-009c Amazon Q App preflight used `/repos/{owner}/{repo}/installations` — endpoint does not exist (HTTP 404 verified). Always fails regardless of installation state. | GP-009c rewritten to use owner-type-aware endpoints (`/orgs/{org}/installations` for orgs, `/user/installations` for the auth user when matching the owner). |
| P0-6 | GP-003 stack detection had only `pyproject.toml → python; package.json → node`. Against Lambda-on-CDK forks like Transactionify (cdk.json + src/python + package.json), detection picked `node` — wrong. | GP-003 now has explicit precedence: `cdk.json + src/<lang>/` → `<lang>+lambda` wins over `package.json`. |
| P0-7 | GP-008 default ruleset included `required_signatures` (signed commits) — would block solo author's demo merge without GPG/SSH signing pre-configured, invalidating the very enforcement being demonstrated. | Removed from default. Signed-commits enforcement documented as opt-in (`.dx.yaml.governance.signed_commits: true`) or ratchet (deploy in `evaluate` mode, promote to `active`) in README §Roadmap. |

### Audit 3 — third pass (P0s missed by audit 2)

| ID | Defect | Resolution |
|---|---|---|
| P0-A | Tickets hardcoded `main` branch references but real fork was on `master`; `origin` pointed to upstream `rrgarciach/transactionify`, not a candidate-controlled fork. | `git branch -m master main` executed. GP-009c preflight refuses to apply governance if origin points to upstream OR default branch is not `main`. |
| P0-B | Audit 2's GP-009a pythonpath fix replaced the path with only `src/python`, breaking existing tests that import `from src.python.transactionify…` (need repo root). | GP-009a now specifies BOTH paths: `pythonpath = ../../../../ ../../../../src/python` (space-separated). |
| P0-C | GP-001 schema did not require a stable `event_id`; `recovered_from_failure_id` (used for MTTR resolution) referenced a non-existent identity key. | `event_id` (UUIDv7) added to required fields. GP-013 aggregator now joins on `event_id` directly, no commit_sha+started_at fallback. |
| P0-D | GP-007 PR pipeline did not declare `permissions: pull-requests: write` on the ai-review job; `gh pr comment` would return 403 at runtime. Integration pipeline emitted `pipeline_run` events instead of `deployment` events, breaking MTTR/Lead-Time computations. | GP-007 ai-review job declares explicit permissions. Integration pipeline emits `event_type=deployment` with `commit_authored_at` and `event_id`. |
| P0-E | GP-009c preflight checked owner-level App installation but did not verify (a) `AMAZON_Q_REVIEW_ENABLED=true` repo variable, (b) repo-level App access for `repository_selection: selected` installations. | Preflight extended with both checks; fail-loud if either is missing. |
| P0-F | GP-003 `out_of_scope` still said "Detecting stack beyond pyproject.toml / package.json" — contradicting the new cdk.json detection scenario. Validation hardcoded `/Users/drapala/Downloads/...` paths (non-portable). | `out_of_scope` updated to reflect precedence rule. Validation paths derived from `git rev-parse --show-toplevel`. |
| P0-G | GP-010 ADR demanded 8 Future Integrations + 6 Consequences + SLSA threat model + diagram + 4 PDF answers — would not fit in the PDF-mandated 2 pages. | ADR slimmed to 3 Consequences + 4 Future Integrations + the 4 PDF anchor sections. Moved-out content (SLSA, signed-commits framing, dx-review framing, pre-push scope, extended Roadmap) lives in README sections. |
| P0-H | Tickets accumulated audit-dialogue scar tissue ("P0-X fix", "earlier draft", "previous version had two bugs") that read as model-vs-reviewer arguing — bad signal for Inner-Source Readiness. | Worst inline parentheticals scrubbed from gherkin/scenarios; this audit-trail.md consolidates the rationale where it belongs (separate from operational tickets). |

## How to reuse this trail

- **Interview prep**: scan this file once, not the tickets. The technical content is in the tickets; the audit reasoning is here.
- **Future RFC authors**: when proposing a change that touches an audited area, link to the relevant row above so reviewers see prior reasoning before re-litigating.
- **Onboarding**: a new platform engineer reads `.kiro/specs/golden-path/{requirements,design,tasks}.md` for the *what*, then this file for *what was hard about getting there*.

## What this file is NOT

- It is not a complete history. Minor tweaks and cosmetic edits are not logged here.
- It is not a substitute for ticket YAMLs (operational form) or specs (conceptual form). Those remain canonical.
- It is not a defense to wave at the CTO. The audits found real issues; the resolutions are visible in the code, not in this file.
