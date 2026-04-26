# Design — Golden Path PoC

> **Source:** derives from [requirements.md](./requirements.md). Each section here cites the REQ-X.Y.Z items it satisfies.
> **Audience:** the platform engineer (or agent) implementing the system. NOT the CTO — the ADR (≤2 pages) is for the CTO; this file is the working design doc.

---

## §1 — Overview

The Golden Path is a two-package platform delivered inside a fork of `transactionify`:

```
golden-path/
├── packages/
│   ├── cli/              # @dx (Python, Typer + Rich); distributed via uv tool install git+...
│   ├── framework/        # @golden-path/framework (TypeScript); distributed via pnpm add git+...
│   └── shared-schemas/   # JSON Schema contracts; consumed by both
└── (the reference service: src/python/transactionify/, lib/transactionify-stack.ts)
```

The two packages **do not share a runtime** (Python ≠ TypeScript) but they **share a contract**: `CHECK_MANIFEST` (a Python dict) is codegened to JSON; the framework imports the JSON statically. The schema files (`dora-event.schema.json`, `dx-config.schema.json`) are the cross-language type backbone.

The reference service is the Integration Case Study target. The platform is **dogfooded** against itself: the platform's PR pipeline (`.github/workflows/pr.yml`) runs against PRs that modify the platform's own packages, and against PRs that modify the reference service.

Satisfies REQ-1, REQ-2, REQ-9.5.

---

## §2 — Design Principles (the 4 that govern decisions)

These are repeated from `.kiro/steering/golden-path.md` for self-containment of this document.

**P1. Convention over Configuration.** Easier to follow the rule than to break it. Work ID enforced at *submission* (not just review). Ruleset is server-side (GitHub Rulesets API). Defaults are good; configuration is the escape hatch, not the path of least resistance.

**P2. Local checks must predict CI.** `dx check` and the CI workflow read commands from the *same* `CHECK_MANIFEST`. When `dx check` exits 0 locally, CI exits 0. The cross-import is enforced by a test that loads the codegened JSON and the workflow fixture and asserts byte-equality on the `run:` strings. This is what differentiates "shift-left" from a slogan.

**P3. Platform governs form, teams own content.** Ruleset, workflow shape, schemas, audit-trail field set — platform-owned. Test content, business logic, per-team policies — team-owned. The `RuntimeAdapter` interface is the contract: platform defines the methods, each team's adapter defines the commands.

**P4. Shared telemetry schema is the contract.** Same raw events from any stack, same aggregator computing the same 4 metrics. Comparability is structural (schema-enforced), not policy (process-enforced). A Python team and a Go team emit the same JSONL shape; `dx dora summarize` computes Deployment Frequency, Lead Time for Changes, CFR, MTTR identically.

Satisfies REQ-9.1, REQ-9.2, REQ-9.4 (P2 specifically).

---

## §3 — Component A: CLI (Python)

### §3.1 — Stack and runtime

- **Language:** Python ≥ 3.11 for the CLI (the Lambda runtime is 3.9 — the CLI is dev tooling, not deployed code).
- **Frameworks:** Typer (command groups), Rich (human output), `pyyaml` + `jsonschema` (validation), `gh` shell-out (governance + PR ops).
- **Output dispatch:** every command supports `--json`. Human output (Rich panels) → stdout; structured output (JSONL) → stdout. Errors → stderr (Rich panel) or `--json` payload with `status: error`.
- **Distribution:** `uv tool install git+<repo-url>#subdirectory=packages/cli`. The `dx` binary is on PATH after install.

Satisfies REQ-1.1, REQ-1.3, REQ-6.1.a.

### §3.2 — Command surface

| Command | Purpose | Stage of work |
|---|---|---|
| `dx init` | Scaffold `.dx.yaml` + PR template + pre-push hook | Bootstrap |
| `dx check` | Lint, unit, PBT, contract, work_id checks | Pre-push and CI |
| `dx branch <id> "<title>"` | Create Work-ID-conformant branch | Branch creation (REQ-1.2.1) |
| `dx pr` | Submit PR with title validated locally first | PR submission (REQ-1.2.2) |
| `dx local up/down` | LocalStack + seeded DynamoDB | Local dev (REQ-8.a) |
| `dx governance apply` | Apply GitHub ruleset idempotently | Governance (REQ-3.2.1) |
| `dx dora summarize --events <jsonl>` | Compute 4 DORA metrics | Telemetry (REQ-5.1.2) |

**No `dx review`.** Reviewals are standardized via the *gate* — server-side ruleset enforces the 2-reviewer rule, CODEOWNERS routes review requests, the Amazon Q App provides automated review, the PR template gives the human reviewer semantic structure. The platform standardizes the *gate*; the *action* (`gh pr review --approve/--request-changes`) lives in the reviewer's tooling. ADR Consequence (e).

### §3.3 — `CHECK_MANIFEST` (the cross-language contract)

`packages/cli/src/dx/checks/manifest.py` defines a Python dict:

```python
CHECK_MANIFEST = {
    "lint":       {"name": "lint",       "cmd": "ruff",   "args": ["check", "."],          "exit_codes_passing": [0]},
    "unit_tests": {"name": "unit_tests", "cmd": "pytest", "args": ["-x", "-q", "-m", "not pbt"], "exit_codes_passing": [0]},
    "pbt":        {"name": "pbt",        "cmd": "pytest", "args": ["-x", "-q", "-m", "pbt"],     "exit_codes_passing": [0]},
    "contract":   {"name": "contract",   "cmd": "...",    "args": [...],                   "exit_codes_passing": [0]},
    "work_id":    {
        "name": "work_id",
        "extract_pattern": r"(LL|GP)-[0-9]+",
        "branch_pattern":  r"^(LL|GP)-[0-9]+-[a-z0-9-]+$",
        "subject_pattern": r"^(LL|GP)-[0-9]+: .+$",
    },
}
```

`packages/cli/src/dx/checks/manifest_codegen.py` serializes this dict to `packages/framework/src/generated/check-manifest.json` (sorted keys, 2-space indent — deterministic). The TS framework imports this JSON statically. **A CI step runs the codegen and `git diff --exit-code` to prevent drift.**

Cross-import enforcement test (`packages/framework/test/workflows/test_workflow_uses_manifest.test.ts`) loads the JSON and the generated PR pipeline fixture, asserts the `run:` strings of each step match `cmd + args` from the manifest byte-for-byte. This closes the loop between P2 (local predicts CI) and operational reality.

Satisfies REQ-1.2.4, REQ-3.1.5, P2.

### §3.4 — Pre-push hook

`dx init` installs `.git/hooks/pre-push` (executable, mode 0755). The hook runs:

1. `dx check work_id` (fast — pure regex on `git rev-parse --abbrev-ref HEAD` + `git log --format=%s`).
2. `dx check lint` (PDF p.4 §3.b literal phrase: "tests/linting").

**Unit tests are NOT in the hook.** Pre-push must stay fast (sub-second) for `git push` to remain frictionless; full test suite would make every push slow and developers would `--no-verify` around it. The PDF's "tests/linting" wording is satisfied by **lint client-side + tests server-side** as a deliberate split. ADR Consequence (f).

Satisfies REQ-1.2.3, REQ-8.b.

---

## §4 — Component B: Framework (TypeScript)

### §4.1 — Stack and structure

- **Language:** TypeScript (strict, ES2022 target, CommonJS module — matches the existing CDK app's tsconfig).
- **Frameworks:** none beyond Node 20 + `js-yaml` (renderer) + `json-schema-to-typescript` (codegen). No React, no test runner duplication; reuses Vitest.
- **Distribution:** `pnpm add git+<repo-url>#path:/packages/framework`.

Satisfies REQ-2.1, REQ-2.4, REQ-6.1.b.

### §4.2 — Workflow generator (the typed builder path)

The PDF suggests `github-actions-workflow-ts` for compile-time safety. The PoC ships a custom renderer because **the workflow generator must consume an external CHECK_MANIFEST JSON manifest the CLI emits**, and the suggested library does not template against external JSON natively — it is a typed builder for static workflow definitions.

The two concerns compose: in production, the right move is `github-actions-workflow-ts` for compile-time safety **with a thin adapter that injects CHECK_MANIFEST values**. Both, not one. ADR Consequence (b) names this evolution path.

The generator API:

```typescript
generatePrPipeline(adapter: RuntimeAdapter, config: DxConfig): WorkflowYaml
generateIntegrationPipeline(adapter: RuntimeAdapter, config: DxConfig): WorkflowYaml
```

Output is rendered to YAML by `renderer.ts` (preserves step ordering, validates against actionlint when available).

The fixtures (`packages/framework/test/fixtures/expected-{pr,integration}-pipeline.yml`) are golden files. Snapshot tests assert byte-equality. **Layered defenses against the "stability not correctness" anti-pattern:** byte-equal snapshot + actionlint validation + `yq`-scoped property assertions (continue-on-error scoped to `ai-review`, `needs:` edges asserted with conjunction not alternation, `AWS_DEFAULT_REGION` env asserted on the right jobs).

Satisfies REQ-2.2.1, REQ-2.2.2, REQ-4.

### §4.3 — `RuntimeAdapter` (Stack-Aware contract)

```typescript
interface RuntimeAdapter {
  lintCommand():      { cmd: string; args: string[]; cwd?: string };
  unitTestCommand():  { cmd: string; args: string[]; cwd?: string };
  pbtCommand():       { cmd: string; args: string[]; cwd?: string };
  contractCommand():  { cmd: string; args: string[]; cwd?: string };
  packageCommand():   { cmd: string; args: string[]; cwd?: string };
}
```

Registry resolves all four PDF-named stacks: `python` → `PythonAdapter`, `go` → `GoAdapter`, `clojure` → `ClojureAdapter`, `typescript` → `TypeScriptAdapter`.

- **`PythonAdapter` is real.** `lint`: `ruff check .`. `unit`: `pytest -x -q -m "not pbt"`. `pbt`: `pytest -x -q -m pbt`. `package`: branches on `service_shape` from `.dx.yaml` — `lambda` → `pnpm cdk synth && tar -czf service-package.tgz cdk.out/`; `wheel` → `uv build`; unset → fail-loud.
- **`Go/Clojure/TypeScript adapters` are stubs.** Each method throws `NotImplementedError` with a message naming the stack and pointing to `docs/adapters/<stack>.md`. The registry resolves the stack (so `.dx.yaml` validates), but method calls fail instructively.

Satisfies REQ-2.3, REQ-9.1.

---

## §5 — Component C: Shared schemas

### §5.1 — `dora-event.schema.json`

Models **raw facts**, not aggregated metrics. Putting `deployment_frequency_per_week` on an event would be a category error. Aggregation is downstream consumer logic (`dx dora summarize`).

REQUIRED on every event: `schema_version`, `event_type` (enum: `pipeline_run | deployment`), `service`, `repository`, `commit_sha`, `actor`, `work_id`, `change_summary`, `outcome` (enum: `success | failure`), `started_at`, `finished_at` (ISO8601 UTC).

CONDITIONAL requireds (JSON Schema `if/then`):

- `source: ci` events → also require `run_id` + `source_url`.
- `event_type: deployment` events → also require `commit_authored_at` (used to compute Lead Time as `finished_at - commit_authored_at`).

`additionalProperties: false` at top level prevents drift.

**MTTR via deployment correlation, not `incident_*` event types.** A "fix" is a successful deployment that recovers from a prior failed one. A deployment event with `is_rework: true` and `recovered_from_failure_id: <id>` references the failure event. `dx dora summarize` indexes deployments by id, looks up the prior failure for each rework, and computes MTTR as `mean(rework.finished_at - failure.started_at)` over the window. **No incident event types in v1** — keeps the schema small and avoids requiring teams to integrate on-call tooling.

Satisfies REQ-5.

### §5.2 — `dx-config.schema.json`

Required fields: `project`, `stack`, `service_shape`. Optional: `custom_steps`, `work_id_pattern`, `agents`, `governance`.

`stack` enum: `python | go | clojure | typescript` (matches the four PDF stacks; `node` is not in the enum — Node services would use `typescript`).

`service_shape` enum: `lambda | wheel | binary`. Required so `PythonAdapter.packageCommand()` knows how to package without guessing.

Satisfies REQ-2.3.

---

## §6 — CI/CD

### §6.1 — PR Pipeline (mandatory)

Topology (DAG via `needs:` edges):

```
            ┌── work-id-pr-title ─┐
lint ───────┤                     ├──┐
            └── unit-tests ─ pbt ─┴── contract ──┬── ai-review (continue-on-error: true)
                                                 ├── cdk-synth ── sandbox-verify ── dora-emit (if: always())
                                                 └── (work-id-pr-title joins sandbox-verify)
```

- Blocking jobs: `lint`, `work-id-pr-title`, `unit-tests`, `pbt`, `contract`, `cdk-synth`, `sandbox-verify`. **No `continue-on-error: true` on these.** Failure blocks downstream via `needs:`.
- Non-blocking job: `ai-review` (Q via `gh pr comment "/q review"`, gated on `vars.AMAZON_Q_REVIEW_ENABLED`).
- Terminal job: `dora-emit` (`if: always()` — emits an event even if upstream failed; `outcome` field reflects success or failure).
- **`AWS_DEFAULT_REGION: us-east-1`** is set at job-level on `unit-tests`, `pbt`, `contract`, `cdk-synth`, `sandbox-verify` because `tools/aws/dynamodb/__init__.py:9` calls `boto3.resource('dynamodb')` at module-import time.
- **`sandbox-verify` is synth-only at PoC fidelity** — no real cloud deploy. The job runs `pnpm cdk synth --context account=<sandbox-stub>` and asserts `cdk.out/` was produced. Real deploy is evolution path requiring OIDC + sandbox AWS account.

Satisfies REQ-4.2.

### §6.2 — Integration Pipeline

Triggers on `push: main` + `workflow_dispatch`. Jobs in topological order:

1. **`build`** — runs `<adapter>.packageCommand()`, uploads artifact via `actions/upload-artifact@v4`. **Mandatory** because `actions/attest-build-provenance@v1` requires a subject.
2. **`attest`** — `permissions: id-token: write, attestations: write, contents: read`. Downloads the artifact, references it via `subject-path`. *Caveat:* attestation references the CDK-synth output bundle (`service-package.tgz`), not per-Lambda-asset zip digests. Per-asset attestation (one subject per `cdk.out/asset.<hash>.zip`) is evolution path via `attest-build-provenance@v2` digest list. ADR Consequence (d).
3. **`deploy-staging`** + **`deploy-prod`** — `environment: staging` / `environment: production` with required reviewers. PoC fidelity: synth-only against context-stub account IDs.
4. **`dora-emit`** — same pattern as PR pipeline; `if: always()`.

Satisfies REQ-4.3.

### §6.3 — Governance

`packages/framework/src/governance/rulesets.ts` builds the default ruleset. **Required-checks list is DERIVED from the regenerated workflow** (`extractBlockingJobsFromWorkflow` parses `pr.yml`, returns jobs with no `continue-on-error` and no `if: always()`). Hardcoding the list would make protection illusory after a job rename.

Default ruleset rules:

```json
[
  { "type": "pull_request",          "parameters": { "required_approving_review_count": 2 } },
  { "type": "required_status_checks", "parameters": { "required_status_checks": [...] } },
  { "type": "deletion" },
  { "type": "non_fast_forward" }
]
```

**`required_signatures` is intentionally NOT in the default.** Including it would block the solo author's demo merge without GPG/SSH signing pre-configured. ADR Future Integration #6 documents two evolution paths: opt-in via `.dx.yaml.governance.signed_commits: true`, or ratchet from `evaluate` to `active` mode.

`dx governance apply` is idempotent: lists rulesets via `gh api /repos/{owner}/{repo}/rulesets`, finds by name match, POSTs (create) or PUTs (update) by numeric id. Endpoint reality: rulesets are addressed by numeric id, not name.

Satisfies REQ-3.2.

---

## §7 — Local development

`docker-compose.yml` brings up LocalStack (v2+; pinned tag) with the AWS services Transactionify uses (DynamoDB at minimum). `.docker/localstack-init.sh` creates the table on container start. `.docker/seed_dynamodb.py` populates fixture records (deterministic UUIDs).

Production code stays untouched. The `boto3` client picks up LocalStack via the `AWS_ENDPOINT_URL` environment variable (boto3 ≥ 1.31 reads it natively — no per-client `endpoint_url=` argument needed). `.docker/.env.local.example` ships the template; `.docker/.env.local` is gitignored.

`dx local up` polls `/_localstack/health` until services are `running` (timeout 30s, fail-loud). Then runs the seed. `dx local down` tears down cleanly.

**Live HTTP curl through Lambda runtime is OUT of PoC scope.** It would require modifying `src/python/transactionify/tools/aws/dynamodb/__init__.py` (production code) plus CDK asset surgery to exclude FastAPI from the Lambda zip. The trade-off: marginal demo gain vs cold-start regression risk + production code change. Evolution path documented (ADR Future Integration #2).

Satisfies REQ-8.a.

---

## §8 — Inner-Source

Three documents form the contribution scaffold:

1. **`CONTRIBUTING.md`** — InnerSource patterns in use: Trusted Committer, Explicit Governance Levels, RFCs.
2. **`docs/RFC-template.md`** — for cross-cutting changes (new stack adapter, new check type, ruleset modification).
3. **`docs/ADR/template.md`** + **`docs/ADR/0002-...md`** — for architectural decisions affecting multiple components.

Per-stack onboarding: `docs/adapters/{python,go,clojure,typescript}.md` — one page each, listing the `RuntimeAdapter` contract, example commands the adapter SHOULD return, and the file the contributor edits. **Stub adapters' error messages cite the doc** so a contributor lands on the right page from a runtime failure.

Satisfies REQ-6.1.g, REQ-9.5.

---

## §9 — Decisions and trade-offs (the things a CTO will press)

These are the explicit cuts that shape the PoC. Each names what was chosen, what was not, and why.

| Decision | Chosen | Not chosen | Why |
|---|---|---|---|
| Workflow renderer | Custom (consumes CHECK_MANIFEST JSON) | `github-actions-workflow-ts` | Suggested library is a typed builder for static definitions; PoC needed external JSON injection. Both compose in production (evolution path). |
| Polyglot stacks | Python real, Go/Clojure/TS stubs with instructive errors | All four real | ~2d each to bring real; PoC scope is wiring and shape, not feature-completeness. Registry resolves all four; method calls fail instructively. |
| Sandbox/Staging/Prod | Synth-only against context-stub account IDs | Real cloud deploy via OIDC | Real deploy requires sandbox AWS account + OIDC role plumbing (~1d) the candidate intentionally did not build for the PoC. Workflow shape is production-true. |
| Build attestation subject | CDK-synth output bundle (`service-package.tgz`) | Per-Lambda-asset zip digests | Per-asset requires `attest-build-provenance@v2` + manifest walk; PoC ships v1 with bundle subject. Honest framing, not "this is what gets deployed". |
| MTTR modeling | `is_rework: true` + `recovered_from_failure_id` on deployment events | Separate `incident_*` event types | Deployment+rework correlation captures the signal without requiring teams to integrate on-call tooling. Schema stays small. |
| Pre-push hook scope | `work_id` + `lint` only | Full test suite | Pre-push must stay fast. Full tests run in CI as required status checks; bypassing the hook still fails on PR open. |
| `dx review` command | Not shipped — reviewals as a *gate* | `gh pr review` wrapper | The convention being enforced is "reviews HAPPENED" (server-side ruleset). Adding a CLI wrapper centralizes nothing and adds a surface to maintain. |
| Signed commits | Not in default ruleset | Default-on | Solo author has no GPG/SSH signing pre-configured; default-on would block the demo's own merge. Opt-in or ratchet path documented. |
| Local HTTP entry-point | Out of PoC | FastAPI/uvicorn wrapping a Lambda handler | Required production-code change + CDK asset surgery; marginal demo gain vs cold-start regression risk. Evolution path. |
| Test discipline check | Cut from PoC | `.dx.yaml.test_discipline.banned_patches` | Original demo case (`@patch('query_by_pk')` on a "removed" symbol) turned out false against the real fork. Discipline-check generality stays as Future Integration. |

---

## §10 — Open questions (deliberately unresolved)

These are ambiguities the design knowingly punts on. Each is a candidate RFC.

1. **Workflow_dispatch with custom inputs** — out of PoC. RFC needed if we want one-off deploys via UI.
2. **Auto-merge configuration** — out of PoC. RFC needed if 2-reviewer + green CI + author-approval should auto-merge.
3. **Multi-environment ruleset variants** (sandbox/staging/prod different rules) — out of PoC. RFC needed for promotion-gate variations.
4. **Drift detection** between desired and applied ruleset state — out of PoC. RFC needed for compliance reporting.
5. **CODEOWNERS auto-generation from contributor history** — out of PoC. May not be desired (gaming risk).
6. **Per-team DORA dashboards** vs single-repo summarize — `dx dora summarize` does single-artifact today; rollup is Future Integration #4.

---

## References

- [requirements.md](./requirements.md)
- [tasks.md](./tasks.md)
- `docs/ADR-0001-architecture.md` (≤2-page CTO-facing version of this design)
- PDF: "Staff Engineer, DevEx Platform — Code Challenge"
