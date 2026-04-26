# Golden Path — DevEx Platform PoC

> **What this is.** A proof-of-concept shared engineering platform — a "Golden Path" — for 10+ independent, full-cycle teams. The platform homologates the development lifecycle so every team operates under the same conventions and reports comparable DORA metrics, regardless of stack. The reference service ([Transactionify](https://github.com/rrgarciach/transactionify) — Python Lambdas on AWS CDK) is the integration case study the platform is dogfooded against.

> **Why this is here.** Submitted as the deliverable for the *Staff Engineer, DevEx Platform* code challenge (5–7 day window). The PoC demonstrates architectural integration, distribution strategy, and the wiring of the ecosystem — not feature completeness. Honest about what's synth-only vs. what's real (see [§Roadmap](#roadmap)).

---

## Architecture (one picture)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       packages/shared-schemas                            │
│   dora-event.schema.json  (raw events, SOC2 audit fields required)       │
│   dx-config.schema.json   (.dx.yaml shape, stack/service_shape enums)    │
│                  ▲                              ▲                        │
│                  │ Python imports JSON          │ TS codegens types      │
└──────────────────┼──────────────────────────────┼────────────────────────┘
                   │                              │
   ┌───────────────┴───────────────┐  ┌───────────┴────────────────────────┐
   │     packages/cli  (uv)        │  │   packages/framework  (pnpm)       │
   │     dx — 7 commands           │  │   GitHub Actions + CDK patterns    │
   │                               │  │                                    │
   │  dx init       scaffold       │  │  WorkflowPlan → YAML (renderer)    │
   │  dx check      lint/unit/PBT  │  │  RuntimeAdapter (4 PDF stacks)     │
   │  dx branch     work_id slug   │  │  Ruleset builder (governance)      │
   │  dx pr         enforce + push │  │  Step builders (lint/unit/pbt/...) │
   │  dx local      LocalStack     │  │                                    │
   │  dx governance ruleset apply  │  │  reads check-manifest.json         │
   │  dx dora       4 metrics      │  │  ◀────────── single source ─────┐  │
   │                               │  │                                  │ │
   │  CHECK_MANIFEST (Python dict) │──┼──── manifest_codegen.py ─────────┘ │
   └───────────────┬───────────────┘  └────────────────┬───────────────────┘
                   │                                   │
                   ▼                                   ▼
              ┌─────────────────────────────────────────────┐
              │  Integration Case Study: Transactionify     │
              │  cdk.json + src/python/transactionify/      │
              │  .dx.yaml + .github/workflows/{pr,integ}.yml│
              │  ruleset golden-path-default applied (live) │
              └─────────────────────────────────────────────┘
```

**Provenance chain.** PDF → `.kiro/specs/golden-path/{requirements,design,tasks}.md` → `golden-path-tickets/<id>.yaml` → code commits (`<work-id>: <description>`). Each commit traces back to a ticket; each ticket cites the design section; each design section cites the requirement.

---

## Quickstart for service teams (5 commands)

After your repo has a `cdk.json` + `src/<lang>/` (or a `pyproject.toml`):

```bash
# 1. Install the CLI (uv tool — isolated, on PATH).
uv tool install --from git+https://github.com/drapala/transactionify.git#subdirectory=packages/cli dx

# 2. Add the framework as a dev dependency (TypeScript types + workflow generator).
pnpm add -D 'github:drapala/transactionify#path:packages/framework'

# 3. Scaffold .dx.yaml + PR template + pre-push hook.
dx init

# 4. Run the same checks CI runs (lint, unit, PBT, contract, work_id).
dx check

# 5. Work-ID-conformant branch + PR (validates locally BEFORE any network call).
dx branch GP-123 "feat: add validator"
git commit -m "GP-123: feat add validator"
dx pr
```

That's it. The pre-push hook runs `dx check work_id` then `dx check lint` before any commit leaves your machine. CI runs the **same** commands sourced from the **same** `CHECK_MANIFEST`.

---

## CLI surface (7 commands)

| Command | What it does | Source ticket |
|---|---|---|
| `dx init` | Scaffold `.dx.yaml`, PR template, pre-push hook. Detects stack from `cdk.json + src/<lang>/` (Lambda) or `pyproject.toml` (wheel) — falls loud on ambiguity. | [GP-003](golden-path-tickets/GP-003-dx-init.yaml) |
| `dx check [name]` | Run lint, unit, PBT, contract, work_id locally — **same code path as CI**. `--json` for scripting. | [GP-004](golden-path-tickets/GP-004-dx-check.yaml) |
| `dx branch <id> "<title>"` | Create a Work-ID-conformant branch (`GP-123-feat-add-validator`). Regex sourced from `CHECK_MANIFEST`. | [GP-002b](golden-path-tickets/GP-002b-dx-branch-pr.yaml) |
| `dx pr [--dry-run]` | Validate branch + commits + PR title locally **before** any `gh` call; submit PR if clean. | [GP-002b](golden-path-tickets/GP-002b-dx-branch-pr.yaml) |
| `dx local up\|down` | LocalStack lifecycle for service-dependency-emulating tests "without cloud latency". Health-check is fail-loud. | [GP-009d](golden-path-tickets/GP-009d-local-env.yaml) |
| `dx governance apply` | Apply the platform GitHub ruleset (idempotent: list → match by name → POST or PUT by id). | [GP-008](golden-path-tickets/GP-008-governance.yaml) |
| `dx dora summarize --events <jsonl>` | Compute the 4 PDF DORA metrics (Deployment Frequency, Lead Time for Changes, Change Failure Rate, MTTR) from raw events. | [GP-013](golden-path-tickets/GP-013-dora-aggregator.yaml) |

`--json` is supported on every command. Output schema is documented in `packages/cli/src/dx/output/`.

There is **no `dx review`** command. Reviewals are standardized via the *gate* (server-side ruleset + CODEOWNERS routing + Amazon Q App + PR template) — not via a CLI wrapper. See [ADR §Decisions](docs/ADR/0001-golden-path.md) for the rationale.

---

## Framework surface

`@golden-path/framework` exports a small, testable set:

```ts
import {
  render,                          // WorkflowPlan → YAML
  generatePrPipeline,              // (adapter, config) → WorkflowPlan
  generateIntegrationPipeline,     // (adapter, config) → WorkflowPlan
  registry, resolve,               // RuntimeAdapter registry (4 PDF stacks)
  buildDefaultRuleset,             // GitHub Rulesets API body
  extractBlockingJobsFromWorkflow, // derive required_status_checks from YAML
  type DoraEvent, type DxConfig,   // codegened from JSON Schema
} from "@golden-path/framework";
```

Type safety enters via the JSON Schema codegen path (`scripts/codegen-types.ts`) — `DoraEvent` and `DxConfig` are derived from `packages/shared-schemas/*.schema.json` and the drift detector test fails CI when they fall out of sync. The renderer is a small (~80 LoC) `WorkflowPlan → YAML` function tested with vitest snapshots **and** `actionlint` against the produced fixtures. See ADR for why we did not use `github-actions-workflow-ts`.

---

## Polyglot stance (PDF requirement)

`RuntimeAdapter` registry resolves all four PDF-named stacks: `python`, `go`, `clojure`, `typescript`. **Python is real** (dogfooded against Transactionify); Go/Clojure/TypeScript are **stubs that throw `NotImplementedError`** with instructive error messages pointing to per-stack docs:

- [docs/adapters/python.md](docs/adapters/python.md) — real
- [docs/adapters/go.md](docs/adapters/go.md) — stub + 5 commands the adapter SHOULD return
- [docs/adapters/clojure.md](docs/adapters/clojure.md) — stub + suggested commands
- [docs/adapters/typescript.md](docs/adapters/typescript.md) — stub + suggested commands

Bringing each stub real costs **~2 days of work** via the documented `RuntimeAdapter` interface contract. See [CONTRIBUTING.md](CONTRIBUTING.md) §Adding a stack.

---

## CI/CD pipelines

Both pipelines are generated by `@golden-path/framework` and committed under `.github/workflows/`. Regenerate idempotently with `pnpm tsx scripts/regenerate-workflows.ts`.

### PR pipeline (`pr.yml`)

```
lint ──► { work-id-pr-title || unit-tests } ──► pbt ──► contract
       ──► { ai-review (continue-on-error) || cdk-synth }
       ──► sandbox-verify  (needs BOTH cdk-synth AND work-id-pr-title)
       ──► dora-emit       (if: always(); emits even on upstream failure)
```

Required-status-checks for the ruleset are **derived** from this YAML (see [GP-008](golden-path-tickets/GP-008-governance.yaml)). If a future blocking job lands, regenerating the ruleset automatically protects it — drift mode: zero.

### Integration pipeline (`integration.yml`)

```
build ──► attest (id-token:write, attestations:write)
       ──► deploy-staging (environment: staging)
       ──► deploy-prod    (environment: production)
       ──► dora-emit
```

> **Honest at PoC fidelity:** `deploy-staging` and `deploy-prod` are **synth-only** (cdk synth against stub account ids). The structural shape (build → attest → staging → prod) is the production-true shape; only the deploy mechanics are placeholders. Real cloud deploy requires OIDC + per-environment AWS roles — see [§Roadmap](#roadmap).

---

## DORA telemetry — single source of truth

Raw events conform to `dora-event.schema.json` (v1). Aggregated metrics are computed downstream by `dx dora summarize` over a JSONL window. **Schema requires** the SOC 2 audit-trail fields (`actor`, `work_id`, `change_summary`, `repository`, etc.) on every event — they are not optional.

| Metric | Derivation |
|---|---|
| Deployment Frequency | `count(deployment, outcome=success in window) / window_days` |
| Lead Time for Changes | `median(deployment.finished_at − commit_authored_at)` |
| Change Failure Rate | `count(deployment, outcome=failure) / count(deployment)` |
| MTTR | `mean(rework.finished_at − failure.started_at)` over rework pairs joined by `event_id` |

A Python team and a Go team emit the **same raw events** under the **same schema**; the **same aggregator** computes the **same four numbers**. Comparability is structural, not policy. Full mapping in [docs/DORA.md](docs/DORA.md).

---

## Repo layout

```
.kiro/                   ← Spec-driven Development evidence (steering + specs)
golden-path-tickets/     ← 15 operational tickets (1:1 with .kiro/specs/golden-path/tasks.md)
packages/
  cli/                   ← `dx` Python CLI (uv tool installable)
  framework/             ← `@golden-path/framework` TypeScript (pnpm installable)
  shared-schemas/        ← JSON Schema contracts (single source of truth)
docs/
  ADR/0001-golden-path.{md,pdf}  ← 2-page architecture decision record
  GOVERNANCE.md          ← what's enforced + evolution path
  DORA.md                ← metric formulas + window semantics
  LOCAL-ENV.md           ← LocalStack offline path (PDF p.4 §3.a verbatim)
  adapters/<stack>.md    ← per-stack contract + 2-day implementation guide
  RFC-template.md        ← propose larger changes
scripts/demo/             ← live demo scripts (≤15 min, 3 acts)
src/python/, lib/, test/ ← Transactionify reference service (integration case study)
```

---

## Documentation index

| Doc | Audience | Why read |
|---|---|---|
| [docs/ADR/0001-golden-path.pdf](docs/ADR/0001-golden-path.pdf) | reviewers | architecture + decisions in 2 pages |
| [CONTRIBUTING.md](CONTRIBUTING.md) | external teams | how to propose RFCs + add a stack adapter |
| [docs/GOVERNANCE.md](docs/GOVERNANCE.md) | platform owners | what the ruleset enforces + evolution path |
| [docs/DORA.md](docs/DORA.md) | metric consumers | exact formulas + comparability claim |
| [docs/LOCAL-ENV.md](docs/LOCAL-ENV.md) | service authors | 5 commands to a seeded LocalStack |
| [docs/adapters/python.md](docs/adapters/python.md) | Python team | real adapter contract + PBT/lambda conventions |
| [docs/DEMO.md](docs/DEMO.md) | reviewers | 15-minute live demo script (3 acts) |
| [docs/PRE-MERGE-SETUP.md](docs/PRE-MERGE-SETUP.md) | reviewers | what to set up locally before reproducing the demo |
| [.kiro/steering/golden-path.md](.kiro/steering/golden-path.md) | AI agents | system prompt — read first for any agent dispatch |

---

## Roadmap

The PoC is honest about its scope. These items are **deliberately out** today; each has a documented evolution path measured in days, not quarters.

| Today (PoC) | Production form | Evolution cost |
|---|---|---|
| `deploy-staging` / `deploy-prod` are **synth-only** | OIDC + per-environment AWS roles + `aws-actions/configure-aws-credentials` + real `cdk deploy` | ~1 day |
| Bundle-level attestation (`service-package.tgz`) | Per-asset attestation via `attest-build-provenance@v2` digest list (one subject per `cdk.out/asset.<hash>.zip`) | ~0.5 day |
| Required signatures **opt-out** of default ruleset | Opt-in via `.dx.yaml.governance.signed_commits=true` (builder already accepts the flag); ratchet via `enforcement: evaluate` first | ~0.5 day + GPG/SSH onboarding flow |
| Amazon Q App **opt-in** (gated on `AMAZON_Q_REVIEW_ENABLED=true`) | Org-wide auto-install on every onboarded repo via Backstage scaffolder | ~1 day |
| Go / Clojure / TypeScript adapters are **stubs** | Real adapters via `RuntimeAdapter` interface contract | ~2 days each |
| `pnpm changeset` config committed; no release workflow wired | `release.yml` GitHub Actions workflow signed via OIDC + npm provenance | ~1 day |
| Ruff baseline is permissive on the unmodified fork source | Tighten over time: enable D, ANN per-package; fix legacy violations on a ratchet | ongoing |
| Live HTTP local path (FastAPI/uvicorn) | Cut from PoC (Lambda runtime regression risk + module-import-time hazard); ADR Future Integrations covers the design | ~1 day |

The trade-off discipline — **what we ship vs. what we mark as evolution path** — is the Staff signal. Promising less and naming the gap honestly is more credible than promising more and shipping a half-broken version.

---

## Pre-dispatch audit trail

Three audit passes consolidated in commit [`67e5e17`](../../commit/67e5e17): agent-driven critique of the spec chain before any implementation commit landed. Audit findings ranked P0/P1/P2 by blast radius; this README's [§Roadmap](#roadmap) is the public-facing cut of the P0/P1 mitigations.

The `scripts/pre-dispatch-check.sh` (commit [`7d15122`](../../commit/7d15122)) runs the entire pre-dispatch readiness suite as a single bash script — every check the audits asked for, in one place.

---

## License

MIT (inherited from upstream Transactionify).

---

## How to evaluate this PoC

The fastest path is **[EVALUATION.md](EVALUATION.md)** — the reviewer cockpit. It has three reading paths (90s / 5min / 15min), a one-command offline evaluator (`./scripts/evaluate.sh`), and live-evidence links (PR pipeline green, integration pipeline green, ruleset live, DORA artifact). Start there; the table below is the long-form version.

If you are the reviewer and time is finite, read in this order:

1. [EVALUATION.md](EVALUATION.md) — reviewer cockpit (90-second / 5-minute / 15-minute paths)
2. [docs/ADR/0001-golden-path.pdf](docs/ADR/0001-golden-path.pdf) (2 pages)
3. [docs/DEMO.md](docs/DEMO.md) (live demo script — preview without running)
4. `.kiro/specs/golden-path/{requirements,design,tasks}.md` (the spec chain)
5. **The 24-commit ticket trail.** Main was squash-merged for clean history; the per-Work-ID prose is preserved at tag `v0.1.0-poc`:
   ```bash
   git fetch origin tag v0.1.0-poc
   git log --reverse --oneline 7d15122..v0.1.0-poc
   ```
   Reads like a narrative: `feat workspace foundation` → `feat shared schemas` → `feat framework foundation` → … → 5 trailing `fix CI ...` commits naming the surfacing path of each dogfood-caught bug. Or browse [PR #1's commits tab](https://github.com/drapala/transactionify/pull/1/commits).
6. Run `dx --help` (or skim `packages/cli/src/dx/cli.py`) to see the surface in <60 seconds
7. Run [docs/PRE-MERGE-SETUP.md](docs/PRE-MERGE-SETUP.md) checklist if you want to reproduce the live demo

The provenance chain (PDF → spec → ticket → commit) is the artifact. The code is the test that the chain is real.
