# Requirements — Golden Path PoC

> **Source:** "Staff Engineer, DevEx Platform — Code Challenge" PDF.
> **Notation:** EARS (Easy Approach to Requirements Syntax) — `WHEN/WHILE/IF/WHERE <trigger or condition>, THE SYSTEM SHALL <observable behavior>`.
> **Numbering:** REQ-X.Y.Z where X = section, Y = sub-section, Z = item. Numbers are stable across edits.

---

## REQ-1 — Component A: The CLI (Python)

**REQ-1.1.1** — THE SYSTEM SHALL provide a Python-based CLI tool, named `dx`, that acts as the primary interface for engineers operating in any project under the platform.

**REQ-1.1.2** — THE SYSTEM SHALL ship at least one functional command demonstrating ecosystem interaction. *Coverage:* `dx init`, `dx check`, `dx branch`, `dx pr`, `dx local`, `dx governance`, `dx dora` (7 functional commands; PDF asks for ≥1).

**REQ-1.2.1** — WHEN a developer creates a branch via `dx branch <work-id> "<title>"`, THE SYSTEM SHALL enforce a Work ID matching `^(LL|GP)-[0-9]+$` and create a branch named `<work-id>-<dash-joined-slug>`.

**REQ-1.2.2** — WHEN a developer runs `dx pr` to submit a PR, THE SYSTEM SHALL validate Work ID conformance on branch name AND commit subjects (since merge-base) BEFORE any network call to the GitHub API.

**REQ-1.2.3** — WHEN `dx init` runs in a clean repo, THE SYSTEM SHALL scaffold three artifacts: `.dx.yaml` (config), `.github/pull_request_template.md` (PR template), and `.git/hooks/pre-push` (executable hook).

**REQ-1.2.4** — WHEN `dx check` runs locally, THE SYSTEM SHALL execute the same commands the CI workflow executes for the corresponding stages (lint, unit, PBT, contract, work_id), reading from a single source of truth (`CHECK_MANIFEST`).

**REQ-1.3** — THE SYSTEM SHALL be packaged and distributable via `uv tool install` directly from a Git repository (no PyPI publication required for PoC).

---

## REQ-2 — Component B: The Workflow Framework (TypeScript)

**REQ-2.1** — THE SYSTEM SHALL provide a TypeScript-based framework (`@golden-path/framework`) that powers CI/CD logic and exports patterns consumable by service repositories.

**REQ-2.2.1** — THE SYSTEM SHALL act as a type-safe library that produces GitHub Actions workflow YAML. *Note:* The PDF suggests `github-actions-workflow-ts`. The PoC ships a custom renderer because the workflow generator must consume an external CHECK_MANIFEST JSON manifest the CLI emits; the suggested library does not template against external JSON natively. See design.md §3.2 for the trade-off; ADR Consequence (b) documents the evolution path (composing the suggested library with a CHECK_MANIFEST adapter).

**REQ-2.2.2** — THE SYSTEM SHALL demonstrate the export of shared logic as **either** a CDK Construct **or** a typed workflow generator. *Coverage:* typed workflow generator path is shipped; CDK construct path is documented as evolution path (ADR Future Integration #5).

**REQ-2.3** — THE SYSTEM SHALL be Stack-Aware: the workflow generator delegates per-stack commands (lint, unit, pbt, contract, package) to a `RuntimeAdapter` instance resolved from the `.dx.yaml.stack` field. *Coverage:* `PythonAdapter` is real; `GoAdapter`, `ClojureAdapter`, `TypeScriptAdapter` are stubs throwing `NotImplementedError` pointing to per-stack docs.

**REQ-2.4** — THE SYSTEM SHALL be packaged and distributable via `pnpm add` directly from a Git repository (no npm registry publication required).

---

## REQ-3 — Shared Conventions & Task Tracking

**REQ-3.1.1** — THE SYSTEM SHALL enforce a Universal Work ID across three contexts: branch names, commit subjects, and PR titles.

**REQ-3.1.2** — IF a branch name does not match `^(LL|GP)-[0-9]+-[a-z0-9-]+$`, THEN THE SYSTEM SHALL fail the `work_id` check with an actionable error.

**REQ-3.1.3** — IF any commit subject (since merge-base with `origin/main`) does not match `^(LL|GP)-[0-9]+: .+$`, THEN THE SYSTEM SHALL fail the `work_id` check with the offending SHA(s) listed and a `git rebase -i + reword` hint.

**REQ-3.1.4** — IF the PR title does not match the same colon-prefixed pattern, THEN the CI `work-id-pr-title` job SHALL fail the PR check.

**REQ-3.1.5** — THE SYSTEM SHALL maintain a single source of truth for the Work ID regex (`CHECK_MANIFEST.work_id.extract_pattern`) consumed by `dx branch`, `dx pr`, `dx check`, and the framework's PR-title CI step. AST-based test enforcement prevents inline duplication.

**REQ-3.2.1** — THE SYSTEM SHALL enforce a Two-Reviewer rule via the GitHub Rulesets API (server-side, not advisory).

**REQ-3.2.2** — THE SYSTEM SHALL standardize PR templates via `.github/pull_request_template.md` scaffolded by `dx init`.

**REQ-3.2.3** — THE SYSTEM SHALL **not** include `required_signatures` (signed commits) in the default ruleset for the PoC. Signed-commits enforcement is documented as evolution path (ADR Future Integration #6) — opt-in via `.dx.yaml.governance.signed_commits: true` or ratchet from `evaluate` to `active` mode.

---

## REQ-4 — CI/CD Framework Stages

**REQ-4.1** — THE SYSTEM SHALL conceptually support two pipeline types: PR Pipeline (mandatory implementation) and Integration Pipeline (functional Plus 3.d).

**REQ-4.2.1** — THE PR Pipeline SHALL implement five blocking stages, each as a distinct workflow job: lint, unit-tests, pbt (Property-Based Testing via Hypothesis on Python), contract (API contract validation against `openapi.yaml` + `dora-event.schema.json`), and `work-id-pr-title` (PR title regex check from `${{ github.event.pull_request.title }}`).

**REQ-4.2.2** — THE PR Pipeline SHALL implement `cdk-synth` and `sandbox-verify` jobs as synth-only at PoC fidelity (no real cloud deploy). *Note:* The PDF asks for "Automated promotion across Sandbox, Staging, Production". Real cloud deploy is documented as evolution path requiring OIDC + per-environment AWS roles.

**REQ-4.2.3** — THE PR Pipeline SHALL trigger Amazon Q Developer review via `gh pr comment "/q review"` as a non-blocking step (`continue-on-error: true`), gated on `vars.AMAZON_Q_REVIEW_ENABLED`.

**REQ-4.2.4** — THE PR Pipeline SHALL emit a DORA event (one `pipeline_run` event) to a JSONL artifact named `dora-events`, with `if: always()` so the event records on success or failure.

**REQ-4.3.1** — THE Integration Pipeline SHALL trigger on `push: main` and `workflow_dispatch`.

**REQ-4.3.2** — THE Integration Pipeline SHALL declare jobs in topological order: `build` → `attest` → `deploy-staging` → `deploy-prod` → `dora-emit`. The `build` job is mandatory because `actions/attest-build-provenance@v1` requires a subject artifact.

**REQ-4.3.3** — THE `attest` job SHALL declare `permissions: id-token: write, attestations: write, contents: read` and reference the artifact uploaded by the `build` job via `subject-path` or `subject-name`.

**REQ-4.4** — THE PR Pipeline SHALL set `AWS_DEFAULT_REGION: us-east-1` at job-level on `unit-tests`, `pbt`, `contract`, `cdk-synth`, and `sandbox-verify` jobs, because the fork's `tools/aws/dynamodb/__init__.py:9` creates a boto3 resource at module-import time and raises `NoRegionError` without it.

---

## REQ-5 — Consistent DORA & Auditability

**REQ-5.1.1** — THE SYSTEM SHALL provide a single source of truth for capturing four DORA core metrics: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Fix (MTTR).

**REQ-5.1.2** — THE SYSTEM SHALL compute the four DORA metrics from raw events via `dx dora summarize --events <jsonl>`, returning a JSON object with keys `deployment_frequency`, `lead_time_for_changes_seconds`, `change_failure_rate`, `mean_time_to_restore_seconds`, plus `window`, `total_events_seen`, `total_events_used`, `schema_version`.

**REQ-5.1.3** — THE SYSTEM SHALL model raw events (`pipeline_run`, `deployment`) and **shall not** model aggregated metrics on individual events. Rework is captured as a boolean fact (`is_rework: true` + `recovered_from_failure_id: <id>`) on a `deployment` event, not as a separate event type.

**REQ-5.2.1** — THE SYSTEM SHALL provide a unified audit trail with the following fields REQUIRED on every event: `schema_version`, `event_type`, `service`, `repository`, `commit_sha`, `actor`, `work_id`, `change_summary`, `outcome`, `started_at`, `finished_at`. *Mapping to SOC2:* `actor` = WHO; `event_type + service + commit_sha + change_summary` = WHAT; `started_at + finished_at` (ISO8601 UTC) = WHEN; `work_id + change_summary` = WHY.

**REQ-5.2.2** — WHEN an event has `source: ci` (emitted from a workflow run), THE SYSTEM SHALL additionally require `run_id` and `source_url` on that event (conditional via JSON Schema `if/then`).

**REQ-5.2.3** — WHEN an event has `event_type: deployment`, THE SYSTEM SHALL additionally require `commit_authored_at` (ISO8601 UTC) — used downstream to compute Lead Time for Changes as `finished_at - commit_authored_at`.

**REQ-5.2.4** — THE schema's `additionalProperties` SHALL be `false` at the top level to prevent silent drift via unstandardized fields.

---

## REQ-6 — Deliverables 1.a through 1.g

**REQ-6.1.a** — THE Ecosystem Prototype repository SHALL contain the Python CLI source code, configured for direct installation from the Git repository via `uv` (no PyPI required).

**REQ-6.1.b** — THE Ecosystem Prototype repository SHALL contain the TypeScript Framework source code, configured for direct installation from the Git repository via `pnpm` (no npm registry required).

**REQ-6.1.c** — THE Ecosystem Prototype repository SHALL contain at least one unit test per tool (CLI and Framework). *Coverage:* multiple per ticket — `packages/cli/tests/`, `packages/framework/test/`, `packages/shared-schemas/tests/`.

**REQ-6.1.d** — THE Ecosystem Prototype repository SHALL contain the logic used to ensure consistent DORA telemetry. *Coverage:* `packages/shared-schemas/dora-event.schema.json` (schema), GP-007 dora-emit step (capture), `packages/cli/src/dx/commands/dora.py` (compute).

**REQ-6.1.e** — THE Ecosystem Prototype repository SHALL contain a comprehensive README for the ecosystem.

**REQ-6.1.f** — THE Ecosystem Prototype repository SHALL contain clear usage instructions on how other teams should install, configure, and consume both the CLI and the Framework directly from the repository.

**REQ-6.1.g** — THE Ecosystem Prototype repository SHALL contain Inner-Source contribution guidelines, including a guide for proposing changes (`docs/RFC-template.md`) and adding new language support (`docs/adapters/`).

---

## REQ-7 — Design Doc (ADR)

**REQ-7.1** — THE SYSTEM SHALL ship a brief PDF file (max 2 pages) at `docs/ADR-0001-architecture.pdf`, page count verified via `pdfinfo`.

**REQ-7.2** — THE ADR SHALL contain an architecture diagram showing CLI ↔ Framework interaction across multiple team-owned services.

**REQ-7.3** — THE ADR SHALL address Homologation: how 10+ teams adopt both the CLI and the Framework.

**REQ-7.4** — THE ADR SHALL address Scalability: how the platform team avoids becoming a bottleneck for custom pipeline features.

**REQ-7.5** — THE ADR SHALL describe a Shift-Left Strategy.

---

## REQ-8 — Plus (3.a through 3.e)

**REQ-8.a** — THE SYSTEM SHALL provide a mechanism to run the service and its dependencies locally to execute tests without cloud latency. *Coverage:* `dx local up/down` orchestrates LocalStack + seeded DynamoDB + dummy AWS credentials. Live HTTP path through Lambda runtime is documented as evolution path.

**REQ-8.b** — THE SYSTEM SHALL provide a Pre-Push Validation mechanism via Git hooks managed by the CLI. *Scoping:* the hook runs `dx check work_id` + `dx check lint` ONLY (not unit tests) — the deliberate trade-off is keeping `git push` fast; full test suite runs in CI as required status checks. ADR Consequence (f) documents the split.

**REQ-8.c** — THE SYSTEM SHALL integrate AI-automated PR review via Amazon Q Developer. *Coverage:* `gh pr comment "/q review"` step in the PR pipeline, gated on `AMAZON_Q_REVIEW_ENABLED`; preflight check (`dx governance apply` precondition) verifies the Q Developer GitHub App is installed on the target repository's owner.

**REQ-8.d** — THE SYSTEM SHALL provide a functional Integration Pipeline triggering on merges to main. *Coverage:* see REQ-4.3.

**REQ-8.e** — THE SYSTEM SHALL include AWS Kiro evidence as `markdown steering files AND specs` providing context for Spec-Driven Development and AI-automated reviews. *Coverage:* this very file (`.kiro/specs/golden-path/requirements.md`) plus `design.md`, `tasks.md`, and `.kiro/steering/golden-path.md`.

---

## REQ-9 — Evaluation Criteria

**REQ-9.1** — DORA metrics SHALL be truly comparable between a Python team and a Go team. *Mechanism:* both teams emit events conforming to the same `dora-event.schema.json`; the same `dx dora summarize` aggregator computes the same four metrics regardless of stack.

**REQ-9.2** — THE SYSTEM SHALL make following the rules easier than breaking them (Convention over Configuration). *Mechanism:* Work ID enforced at *submission* (`dx pr` validates BEFORE network call); ruleset enforced server-side (cannot be bypassed by ignoring the CLI); pre-push hook catches client-side; same checks run in CI as required status checks.

**REQ-9.3** — Distribution SHALL be clean, versioned, and professional. *Coverage:* `pyproject.toml` declares `[project.version]`, `dx --version` returns SemVer; `package.json` declares `version`; `pnpm changesets` configured for future independent SemVer release cycles (production-form caveat).

**REQ-9.4** — THE SYSTEM SHALL reduce time between defect introduction and detection. *Mechanism:* pre-push hook (~1s feedback for work_id + lint), local `dx check` (full check loop in seconds), CI parallel jobs (lint || work-id-pr-title; ai-review || cdk-synth), Amazon Q non-blocking on contract pass for early signal.

**REQ-9.5** — Documentation SHALL be clear enough for another team to contribute a feature without constant hand-holding. *Coverage:* `CONTRIBUTING.md` (process), `docs/adapters/<stack>.md` (per-stack onboarding), `docs/RFC-template.md` (cross-cutting changes), `docs/ADR/template.md` (architectural decisions), `.kiro/steering/golden-path.md` (agent-readable conventions).

---

## REQ-10 — Interview Expectations

**REQ-10.1** — THE candidate SHALL deliver an Architecture Deep Dive explaining design choices and integration between CLI and Framework. *Source artifact:* ADR-0001 + this requirements.md + design.md.

**REQ-10.2** — THE candidate SHALL deliver a Live Demo of the PoC. *Source artifact:* `docs/DEMO.md` (2 acts + closing) + `demo/*.sh` scripts + `demo/expected-output/` snapshots for fallback narration.

**REQ-10.3** — THE candidate SHALL deliver an Installation Walkthrough installing both components directly from the Git repository. *Source artifact:* DEMO.md Act 1 with `uv tool install git+...` and `pnpm add git+...#path:packages/framework`.

**REQ-10.4** — THE candidate SHALL deliver an Integration Case Study within a fork of Transactionify. *Source artifact:* this fork itself; the platform is dogfooded against the reference service.

---

## Out of scope (explicit non-requirements)

- ❌ Real cloud deploys (Sandbox/Staging/Production) — synth-only at PoC fidelity; evolution path documented.
- ❌ Real Go / Clojure / TypeScript adapter implementations — stubs only with instructive errors.
- ❌ FastAPI/uvicorn local HTTP entry-point — cut from PoC to keep production code untouched.
- ❌ `dx review` CLI command — reviewals standardized as a *gate* (ruleset + CODEOWNERS + Q + PR template), not as a CLI action. ADR Consequence (e).
- ❌ Signed-commits in default ruleset — opt-in via `.dx.yaml`; ratchet path documented.
- ❌ Test discipline check (`.dx.yaml.test_discipline.banned_patches`) — Future Integration; cut from PoC after the underlying demo case turned out false against the real fork.
- ❌ Multi-repo DORA aggregation rollup — Future Integration #4.
- ❌ Backstage catalog/portal layer — `catalog-info.yaml` stub shipped as connector; full integration is Future Integration #1.
- ❌ Independent SemVer release cycles for `packages/*` — production-form caveat in README; PoC ships dogfood-style co-located.
