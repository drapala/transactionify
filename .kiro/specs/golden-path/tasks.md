# Tasks — Golden Path PoC

> **Source:** decomposes [design.md](./design.md). Each task maps 1:1 to a YAML ticket in `golden-path-tickets/<id>.yaml` (operational form).
> **Status legend:** `[ ]` = todo (not yet implemented); `[~]` = in-progress (partial in fork's git tree); `[x]` = done (implementation merged).
> **Provenance:** every implementation commit carries a Work ID (`GP-NNN: …`) traceable back to the matching task here, which traces back to the requirement in [requirements.md](./requirements.md).

---

## Layer 0 — Foundation

- [~] **GP-000** — Workspace foundation: pnpm + uv monorepo + base scripts + `.changeset/` + dev tooling check (actionlint, ruff, pytest, prettier, vitest, pdfinfo, jsonschema). Spec-first artifacts (`.kiro/`, `golden-path-tickets/`, `docs/ADR/`, `docs/RFC-template.md`, `catalog-info.yaml`, `docs/api/`) are pre-existing in the fork before this task runs; the task verifies and complements, not creates.
  - Ticket: `golden-path-tickets/GP-000-workspace-foundation.yaml`
  - Satisfies: REQ-6.1.a, REQ-6.1.b (workspace plumbing for both)

## Layer 1 — Contracts and CLI shell (parallel)

- [ ] **GP-001** — Shared schemas: `dora-event.schema.json` (raw events, hard-required SOC2 fields, conditional requireds for `source: ci` and `event_type: deployment`) + `dx-config.schema.json` (project, stack, service_shape).
  - Ticket: `golden-path-tickets/GP-001-shared-schemas.yaml`
  - Satisfies: REQ-5, REQ-2.3 (config schema)

- [ ] **GP-002** — CLI foundation: Typer + Rich, `--json` shell, `dx --help`, `dx --version`, output dispatch in `dx/output/`.
  - Ticket: `golden-path-tickets/GP-002-cli-foundation.yaml`
  - Satisfies: REQ-1.1, REQ-1.3

## Layer 2 — First features (parallel)

- [ ] **GP-003** — `dx init`: scaffold `.dx.yaml` + PR template + pre-push hook (work_id + lint, NOT unit tests). Stack detection precedence: `cdk.json + src/python/` → `python/lambda` (wins over `package.json`).
  - Ticket: `golden-path-tickets/GP-003-dx-init.yaml`
  - Satisfies: REQ-1.2.3, REQ-8.b

- [ ] **GP-004** — `dx check`: lint, unit, PBT, contract, work_id checks; owns `CHECK_MANIFEST` (Python dict) AND `manifest_codegen.py` (emits JSON for the framework's static import).
  - Ticket: `golden-path-tickets/GP-004-dx-check.yaml`
  - Satisfies: REQ-1.2.4, REQ-3.1.5, P2 (Local checks must predict CI)

- [ ] **GP-005** — Framework foundation: TS package, types codegened from shared schemas, base workflow renderer, `pnpm` workspace member.
  - Ticket: `golden-path-tickets/GP-005-framework-foundation.yaml`
  - Satisfies: REQ-2.1, REQ-2.4

- [ ] **GP-013** — DORA aggregator: `dx dora summarize --events <jsonl>` computes the 4 PDF metrics (Deployment Frequency, Lead Time for Changes, Change Failure Rate, MTTR) from raw events.
  - Ticket: `golden-path-tickets/GP-013-dora-aggregator.yaml`
  - Satisfies: REQ-5.1.2, REQ-9.1

## Layer 3 — Second features (parallel)

- [ ] **GP-002b** — `dx branch` + `dx pr`: Work ID-enforcing wrappers. AST test asserts no module hardcodes the regex; both consume `CHECK_MANIFEST.work_id.{branch_pattern, subject_pattern}`.
  - Ticket: `golden-path-tickets/GP-002b-dx-branch-pr.yaml`
  - Satisfies: REQ-1.2.1, REQ-1.2.2, REQ-3.1

- [ ] **GP-006** — `RuntimeAdapter` interface + Python real + Go/Clojure/TypeScript stubs. Registry resolves all four PDF stacks; stubs throw `NotImplementedError` pointing to `docs/adapters/<stack>.md`.
  - Ticket: `golden-path-tickets/GP-006-runtime-adapter.yaml`
  - Satisfies: REQ-2.3, REQ-9.1, REQ-9.5

- [ ] **GP-008** — Governance: ruleset generator (required-checks list DERIVED from regenerated workflow, not hardcoded) + `dx governance apply` (idempotent via list-then-match-by-name → POST or PUT by id). NO `required_signatures` in default; opt-in path documented.
  - Ticket: `golden-path-tickets/GP-008-governance.yaml`
  - Satisfies: REQ-3.2.1, REQ-3.2.3

## Layer 4 — Composition

- [ ] **GP-007** — PR/integration workflow generator: stages (lint, work-id-pr-title, unit-tests, pbt, contract, cdk-synth, sandbox-verify, ai-review, dora-emit) + integration pipeline (build, attest, deploy-staging, deploy-prod, dora-emit) + cross-import enforcement (workflow reads commands from `check-manifest.json` byte-for-byte) + `AWS_DEFAULT_REGION: us-east-1` at job-level.
  - Ticket: `golden-path-tickets/GP-007-workflow-generator.yaml`
  - Satisfies: REQ-4 (entire), REQ-8.c (Q via comment-trigger), REQ-8.d (integration pipeline)

## Layer 5 — Fork integration starts

- [ ] **GP-009a** — Transactionify config + generated workflows committed: `.dx.yaml`, `.github/workflows/{pr,integration}.yml`, `pyproject.toml` (ruff baseline + project metadata), `package.json` (add `source-map-support` for pnpm strict isolation), Hypothesis test (`test_uuid_properties.py` — round-trip property `is_valid_uuidv7(generate_uuidv7())`, NOT monotonicity), fork-test fixes (4 handler `__init__.py`, `test_transaction.py` patch targets, `pytest.ini` pythonpath + `pbt` marker).
  - Ticket: `golden-path-tickets/GP-009a-transactionify-config.yaml`
  - Satisfies: REQ-10.4 (Integration Case Study)

## Layer 6 — Fork integration (parallel)

- [ ] **GP-009d** — Local env: `docker-compose.yml` (LocalStack v2+), `.docker/localstack-init.sh`, `.docker/seed_dynamodb.py`, `.docker/.env.local.example` (dummy AWS creds), `dx local up/down` wrapper with health-check fail-loud. Production code untouched (boto3 ≥ 1.31 reads `AWS_ENDPOINT_URL` natively).
  - Ticket: `golden-path-tickets/GP-009d-local-env.yaml`
  - Satisfies: REQ-8.a

## Layer 7 — Fork governance

- [ ] **GP-009c** — Dogfood governance: CODEOWNERS, `dx governance apply` against the fork, observable via `gh ruleset list`. Amazon Q App preflight uses owner-type-aware endpoint (`/orgs/$OWNER/installations` for orgs, `/user/installations` for the auth user).
  - Ticket: `golden-path-tickets/GP-009c-dogfood-governance.yaml`
  - Satisfies: REQ-3.2, REQ-8.c (preflight)

## Layer 8 — Narrative (HAND, not pipeline)

- [ ] **GP-010** — ADR-0001.pdf (≤2 pages, page count verified via `pdfinfo`) + README + DEMO.md (2 acts + closing) + CONTRIBUTING.md + per-stack adapter docs + `.kiro/steering/golden-path.md` (already exists, this task verifies + updates) + `.kiro/specs/golden-path/` (already exist, verify + update). Demo scripts (`demo/preflight.sh`, `demo/act{1,2}_*.sh`, `demo/closing_*.sh`, `demo/reset.sh`) + `demo/expected-output/` snapshots + `demo/PRE-MERGE-SETUP.md`.
  - Ticket: `golden-path-tickets/GP-010-narrative.yaml`
  - Satisfies: REQ-6.1.e, REQ-6.1.f, REQ-6.1.g, REQ-7, REQ-8.e, REQ-10.1, REQ-10.2, REQ-10.3
  - **Delegate: hand (NOT pipeline).** AI-flavored ADR/README is the failure mode that loses Staff-level interviews. Pipeline reviews; author writes.

---

## Critical path

```
GP-000 → GP-001 → GP-005 → GP-006 → GP-007 → GP-009a → GP-009c → GP-010
```

8 sequential. **Parallel branches:**

- CLI track: GP-002 → GP-003 + GP-004; GP-002b after GP-003+GP-004.
- DORA aggregator: GP-013 in parallel with framework track (only needs GP-001+GP-002).
- Governance: GP-008 after GP-002+GP-005, converges into GP-009c.
- Local env: GP-009d after GP-009a (LocalStack-only, no production code change).

---

## Pre-existing artifacts (in the fork before any task runs)

These are the spec-first commits that establish provenance BEFORE GP-000 dispatch executes. The git log shows them as the candidate's first commits after upstream:

- `.kiro/steering/golden-path.md` — agent-readable conventions
- `.kiro/specs/golden-path/{requirements,design,tasks}.md` — this directory
- `golden-path-tickets/*.yaml` — operational form of these tasks (15 active YAMLs + README)
- `docs/ADR/template.md` + `docs/ADR/0002-rfc-process.md`
- `docs/RFC-template.md`
- `catalog-info.yaml` (Backstage stub)
- `docs/api/transactionify.bru` (Bruno collection)

GP-000 verifies these exist; subsequent tasks consume them.

---

## Done = ?

A task is `[x] done` when:

1. The corresponding YAML ticket's `validation_commands` all pass.
2. The implementation commit subject matches `^(LL|GP)-NNN: .+$`.
3. The PR carrying the implementation has the same Work ID in title and at least one commit.
4. CI green on the implementation PR (lint + unit + pbt + contract + work-id-pr-title + cdk-synth + sandbox-verify).
5. The corresponding requirement in [requirements.md](./requirements.md) is verifiable from the merged code.

Do not mark `[x]` based on local testing alone. CI is the contract; merge is the trigger.
