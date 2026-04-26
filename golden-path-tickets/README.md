# Golden Path PoC — Backlog

15 active tickets after the trim audit (was 16; GP-011 stretch and GP-012 test-discipline both archived; GP-013 DORA aggregator added). They build the DevEx Platform PoC inside the Transactionify fork.

> Note: ticket IDs have intentional gaps. GP-009b was absorbed into the (now-archived) GP-012; the trim audit then archived GP-012 as well — discipline-check survives only as an evolution-path bullet in the ADR. GP-011 was a stretch ticket cut at the same time. GP-002b uses a sub-letter because it co-evolved with GP-002 during planning. Counting active YAML files at the repo root is the source of truth (`archive/` does not count).

> **Apply order:** these are sequenced by dependency. The pipeline can parallelize on the CLI/framework split (see graph), but `GP-001` must land first because every other ticket reads its schemas. GP-013 (DORA aggregator) only needs GP-001 + GP-002, so it runs in parallel with the framework track.

---

## Ticket schema

```yaml
id: GP-NNN                  # canonical identifier
title: "..."                # one line
tier: A | B | C             # claude-pipeline tier_classify input
delegate: pipeline | hand | hybrid
delegate_reason: "..."      # short justification
review_mode: standard | pre_pr_review | human_only
blast_radius: low | medium | high
stretch: false              # true → skip if upstream tickets behind

depends_on: [GP-XXX]

paths:
  primary: "..."            # main file the ticket creates/edits
  secondary: [...]          # other files touched
  schema: [...]             # schema files referenced (optional)
  test: [...]               # test files added

gherkin:
  - scenario: "..."
    given: ["..."]
    when: ["..."]
    then: ["..."]

out_of_scope:               # what the agent must NOT do
  - "..."

validation_commands:        # CI assertions, runnable
  - "..."

demo_signal: "..."          # how this ticket contributes to the 5-min demo

notes: "..."                # optional, only when nuance matters
```

---

## Backlog (15 active tickets)

| # | ID | Title | Tier | Delegate | Review |
|---|---|---|---|---|---|
| 0 | GP-000 | Workspace foundation (pnpm + uv + base scripts) | A | pipeline | standard |
| 1 | GP-001 | Shared schemas (DORA event v1 with audit fields + .dx.yaml) | A | pipeline | pre_pr_review |
| 2 | GP-002 | CLI foundation (Typer + Rich + JSON shell) | A | pipeline | standard |
| 3 | GP-002b | dx branch + dx pr (Work ID-enforcing wrappers) | A | pipeline | standard |
| 4 | GP-003 | dx init | A | pipeline | standard |
| 5 | GP-004 | dx check (lint + unit + PBT + contract + work_id; owns CHECK_MANIFEST + manifest_codegen) | A | hybrid | pre_pr_review |
| 6 | GP-005 | Framework foundation | A | pipeline | standard |
| 7 | GP-006 | RuntimeAdapter (Python real + Go/Clojure/TypeScript stubs — all 4 PDF stacks) | A | hybrid | pre_pr_review |
| 8 | GP-007 | PR/integration workflow generator (+ build job + Q + DORA + attestation + cross-import via codegened manifest.json) | A | pipeline | pre_pr_review |
| 9 | GP-008 | Governance ruleset generator + dx governance apply | A | pipeline | pre_pr_review |
| 10 | GP-009a | Transactionify config + generated workflow | A | hybrid | pre_pr_review |
| 11 | GP-009c | Dogfood governance + PR template + CODEOWNERS + Q App install check | A | hybrid | pre_pr_review |
| 12 | GP-009d | Local env (LocalStack + dx local up/down + seed; FastAPI adapter cut from PoC) | A | pipeline | standard |
| 13 | GP-013 | DORA aggregator — `dx dora summarize` (4 PDF metrics from raw events) | A | pipeline | pre_pr_review |
| 14 | GP-010 | ADR.pdf (≤2pp) + README + DEMO (2 acts + closing) + .kiro/steering + .kiro/specs | A | **hand** | human_only |

**Archived (in `archive/`):**
- GP-011 — `dx agents init` stretch ticket; cut to keep critical path lean
- GP-012 — test discipline + typed contracts; cut after audit found the load-bearing demo case (`@patch('query_by_pk')` on a symbol that "no longer exists") was false against the real fork (the symbol still exists in `tools/aws/dynamodb/__init__.py`); the discipline-check generality survives as a Future Integrations bullet in the ADR (`.dx.yaml.test_discipline.banned_patches` as a project-configurable governance hook — same pattern as required_status_checks but applied to test source)

---

## Dependency graph (layered)

```
Layer 0 — foundation
   GP-000  workspace (pnpm + uv)

Layer 1 — contracts + CLI shell (parallel; both only need GP-000)
   GP-001  schemas              (depends_on: GP-000)
   GP-002  CLI shell            (depends_on: GP-000)

Layer 2 — first features (parallel)
   GP-003  dx init              (depends_on: GP-001, GP-002)
   GP-004  dx check + MANIFEST + manifest_codegen (depends_on: GP-001, GP-002)
   GP-005  framework foundation (depends_on: GP-000, GP-001)
   GP-013  dx dora summarize    (depends_on: GP-001, GP-002)  ← parallel with framework track

Layer 3 — second features (parallel)
   GP-002b dx branch + dx pr    (depends_on: GP-003, GP-004 — reuses MANIFEST regex via AST-enforced import)
   GP-006  RuntimeAdapter       (depends_on: GP-005) — Python real + Go/Clojure/TS stubs
   GP-008  governance           (depends_on: GP-002, GP-005)

Layer 4 — composition
   GP-007  workflow generator   (depends_on: GP-001, GP-004, GP-005, GP-006) — includes build job for attestation + manifest.json codegen consumer

Layer 5 — fork integration starts
   GP-009a transactionify config (depends_on: GP-003, GP-005, GP-006, GP-007)

Layer 6 — fork integration (parallel)
   GP-009d local env             (depends_on: GP-002, GP-009a) — LocalStack-only, no production code change

Layer 7 — fork governance
   GP-009c dogfood governance    (depends_on: GP-008, GP-009a)

Layer 8 — narrative (HAND)
   GP-010  ADR.pdf + README + DEMO + .kiro  (depends_on: all of GP-001..GP-009d + GP-002b + GP-013)
```

**Critical path:** GP-000 → GP-001 → GP-005 → GP-006 → GP-007 → GP-009a → GP-009c → GP-010 (8 sequential — was 9; GP-012 dropped from the chain). GP-013 is parallel (only needs GP-001+GP-002), GP-009d is parallel after GP-009a.

## PDF deliverable traceability

Each ticket maps to one or more explicit asks from the challenge PDF:

| PDF deliverable | Ticket(s) |
|---|---|
| Brief PDF file (max 2 pages) | GP-010 (ADR.pdf with page-count validation) |
| Component A — CLI | GP-002, GP-002b, GP-003, GP-004 |
| Branch creation, PR submission (literal PDF mention) | GP-002b (`dx branch`, `dx pr`) |
| Component B — Framework / typed workflow generator | GP-005, GP-006, GP-007 |
| PR Pipeline (mandatory) | GP-007 (PR pipeline with sandbox stage) |
| Integration Pipeline (extra) | GP-007 (integration with attestation + staging/prod) |
| Stages: Lint, Unit Tests, **PBT**, API Contract, CDK Synth/Diff, Deploy (Sandbox/Staging/Production) | GP-004 (5 checks), GP-006 (PBT in adapter), GP-007 (all stages + build job; deploy-* are synth-only at PoC fidelity, real cloud deploy is ADR Future Integrations evolution path requiring OIDC + sandbox AWS account) |
| Polyglot framework support (Python, Go, Clojure, TypeScript) | GP-006 (PythonAdapter real; Go/Clojure/TypeScript stubs — all 4 stacks resolve in registry) |
| Work ID enforcement (branch + commits + PR title) | GP-004 (branch+commits, pre-push), GP-007 (PR title in CI) |
| Unified audit trail (SOC2 who/what/when/why) | GP-001 (actor + work_id + change_summary + repository all REQUIRED at schema level; run_id + source_url required for source: ci), GP-007 (CI emits with full audit field set) |
| 4 core DORA metrics — capture AND computation | GP-001 (raw events schema with v1 enum: pipeline_run \| deployment; deployment events require commit_authored_at for Lead Time; is_rework + recovered_from_failure_id power MTTR via deployment correlation, no incident_* events needed), GP-007 (dora-emit step uploads JSONL artifact with full SOC2 audit field set), GP-013 (`dx dora summarize` computes Deployment Frequency, Lead Time for Changes, Change Failure Rate, MTTR from raw events) |
| Cross-language single source of truth for check commands | GP-004 (CHECK_MANIFEST in Python + manifest_codegen.py emits JSON), GP-007 (TS framework imports check-manifest.json statically; CI fails on stale codegen) |
| Local env ("without cloud latency", PDF p.4 § 3.a) | GP-009d (LocalStack + dx local up/down + seed — service-dependency layer; live HTTP path via FastAPI is ADR Future Integrations evolution path, cut from PoC) |
| Build attestation (Plus 3.d Integration Pipeline) | GP-007 (build job produces artifact; attest job uses `actions/attest-build-provenance@v1` with subject-path resolved to that artifact — earlier draft missing build job would have failed at runtime) |
| Install via uv + pnpm direct from Git | GP-010 (DEMO.md Act 1 commands; validated via grep) |
| AWS Kiro Evidence — steering AND specs (PDF p.5 §3.e) | GP-010 (`.kiro/steering/golden-path.md` + `.kiro/specs/golden-path/{requirements,design,tasks}.md`) |
| Amazon Q integration (Plus 3.c) | GP-007 (comment-trigger via `gh pr comment /q review`, gated on AMAZON_Q_REVIEW_ENABLED), GP-009c (preflight check that App is installed; fails loud rather than silent no-op during demo) |
| Platform-level test discipline | NOT delivered in PoC; ADR Future Integrations bullet (`.dx.yaml.test_discipline.banned_patches` — same governance pattern as required_status_checks but applied to test source). Cut from PoC after audit showed the demo case ("symbol no longer exists") was false against the real fork |

**Parallelizable after GP-001:**
- CLI track: GP-002 → GP-003 + GP-004 (GP-004 then feeds GP-007 via `manifest_codegen.py` → `check-manifest.json`)
- Framework track: GP-005 → GP-006 → GP-007
- Governance: GP-008 runs alongside (depends only on GP-002 + GP-005), then converges into GP-009c
- DORA aggregator: GP-013 runs alongside the framework track (only needs GP-001 + GP-002)

**Why GP-007 depends on GP-004:** GP-004 owns the `CHECK_MANIFEST` contract AND the `manifest_codegen.py` script that emits `packages/framework/src/generated/check-manifest.json`. GP-007's workflow generator imports that JSON statically (Design Principle 2: local checks predict CI). The cross-import enforcement test lives in GP-007: it asserts byte-equal commands AND runs codegen + `git diff --exit-code` to prevent the JSON from drifting silently.

**Why GP-009c depends on GP-008 (not in the chain through GP-009a):** GP-009c applies the ruleset generator from GP-008 against the fork; GP-009a only creates config + workflow files. The two converge at 9c, they don't chain.

**Why GP-013 is a separate ticket (not folded into GP-001 or GP-007):** GP-001 owns the raw-event schema; aggregation is consumer logic and would leak into the schema package. GP-007 owns the workflow generator; coupling a CLI consumer to a TS framework would be the wrong dependency direction. GP-013 lives alongside `dx check` in `packages/cli/` — same shape as other dx commands. It is the reason the deliverable answer to PDF p.3 "Core Metrics" is **whole** rather than partial: capture (GP-001) + emission (GP-007) + computation (GP-013).

---

## CLI invocation convention (P1-7 — pinned for pipeline agents)

Validation commands and demo scripts use one of two forms; agents pick by context:

- **Bare `dx <command>`** — when running from a directory that does NOT have a Python project (e.g. `/tmp/gp003-test`, `/tmp/pnpm-install-test`). Requires `uv tool install --editable packages/cli` to have run first (this is GP-002's invariant; the install IS in GP-002's validation block).
- **`uv run dx <command>`** — when running from a directory that IS a Python project (the fork root after GP-000 commits the workspace `pyproject.toml`, the packages/cli/ directory, etc.). `uv run` looks for a venv via the project; outside a project it errors with "no project found".

Tickets that mix these two forms reflect this convention deliberately. If a pipeline agent encounters a "no project found" error from `uv run dx ...`, switch to bare `dx`. If a pipeline agent encounters "command not found: dx", run `uv tool install --editable packages/cli` first.

This is documented here rather than per-ticket because per-ticket repetition was both noisy and inconsistent. The rule is one rule.

---

## Routing rules for claude-pipeline

- All tier `A` → eligible for auto-merge after `pre-pr-review` consolidates findings + author trinco
- `delegate: hand` (GP-010) → **don't dispatch to pipeline**. Author writes; pipeline reviews.
- `delegate: hybrid` → pipeline drafts the PR; author reviews diff with extra attention before marking ready
- `review_mode: pre_pr_review` → run the full 6-layer pipeline (mechanical + 5 LLM subagents)
- `review_mode: standard` → mechanical + fresh-eyes-pr + test-rubric-audit only
- `review_mode: human_only` → no automation; author handles end-to-end
- (GP-011 stretch routing rule no longer applies — ticket archived)

---

## Demo signal coverage check

Every ticket has `demo_signal`. Cross-checked against the 2-act + closing demo (was 3 acts before the trim; live HTTP curl in old Act 3 cut to remove flake surface):

**Act 1 — Bootstrap:** GP-002 (`dx --help`), GP-003 (`dx init`), GP-007 (workflow generated, including build job), GP-006 (adapter — Python real, 3 stubs visible in registry), GP-008 (ruleset), GP-001 (DORA schema visible), GP-009c (`gh ruleset list` proves enforcement)

**Act 2 — Failure Loop + DORA:** GP-002b (`dx branch` + `dx pr` enforce Work ID via AST-validated CHECK_MANIFEST import), GP-004 (`dx check` predicts CI; same code path), GP-007 (Q non-blocking + DORA artifact uploaded), GP-009a (real PR on real fork), **GP-013 (`dx dora summarize` prints the 4 PDF metrics from the real artifact — the closing beat that converts 'capture' into 'computation')**

**Closing — Local stack narrated:** GP-009d (`dx local up` brings up LocalStack with seeded DynamoDB; `aws --endpoint-url=... dynamodb scan` proves the table is populated; live HTTP curl is OUT, narrated as evolution path), GP-010 (ADR sentence)

Tickets without demo presence: none (every ticket pulls weight). GP-005 surfaces indirectly via GP-007's generated YAML.

---

## Self-application sentence

The README of the fork must include this line (regra: 1 sentença, não expande):

> The CLI and framework artifacts in this PoC follow the same conventions they propose — branches and commits carry Work IDs; the CLI check manifest is codegened into the JSON the framework workflow generator imports; every change ships with gherkin acceptance criteria in its ticket.

Owned by GP-010.

> **Why this rewrite (three times now):** v1 ("small scoped changes, automated checks, review gates, evidence-backed acceptance criteria") was retired because "small scoped" was indefensible against multi-file tickets and "review gates" implied 2-reviewer enforcement that does not apply to a solo author. v2 ("automated checks gating each commit, schema-driven contracts...") was retired because "gating each commit" implied the platform was live before its own first commit (chicken/egg). v3 ("schemas drive both the CLI checks and the framework workflow generator") was retired because "schemas drive the workflow generator" was loose — what drives the generator is the codegened CHECK_MANIFEST JSON, not the schemas (schemas drive the types). The current version (v4) points only at mechanisms verifiable from the diff right now: Work IDs in `git log`, codegened `check-manifest.json` on disk, gherkin in each ticket YAML. Three claims, each independently provable, no conflation.

---

## Production-form caveat (callout for README)

> Packages live inside this fork as a dogfooding convenience for the PoC. In production, `packages/cli`, `packages/framework`, and `packages/shared-schemas` would have independent SemVer releases; Transactionify and other services would consume them as external dependencies.

Owned by GP-010.
