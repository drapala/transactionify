# EVALUATION.md — reviewer cockpit

> Three reading paths (90s / 5min / 15min). Each one ends in a verifiable artifact, not a claim. If you only have a few minutes, do path 1. If you want to verify locally, do path 2. If you want the live demo, path 3.

---

## 90-second read path

| # | Read | Why |
|---|---|---|
| 1 | [docs/ADR/0001-golden-path.pdf](docs/ADR/0001-golden-path.pdf) (2 pages) | Decisions table + trade-offs explicitly named |
| 2 | [README.md §Architecture](README.md#architecture-one-picture) | ASCII diagram: schemas → CLI + Framework → Transactionify |
| 3 | [Deliverable matrix](#deliverable-matrix-pdf-mapping) (below) | PDF item → status → file path |
| 4 | [Honest PoC limits](#honest-poc-limits) (below) | What's synth-only / opt-in / evolution path |

---

## 5-minute verification path

```bash
# Clone + offline evaluation (no GitHub admin, no Q App, no Docker required).
git clone https://github.com/drapala/transactionify.git
cd transactionify
./scripts/evaluate.sh
```

**Preconditions:** Node 20+, `pnpm` 9+, `uv`, `jq`, `pdfinfo`. The script lists the install command for each missing tool and exits non-zero. **First-run cost:** ~1–2 minutes (pnpm + uv download dependencies on the first invocation; subsequent runs are seconds).

`scripts/evaluate.sh` runs the **offline-evaluator suite**: validates lockfiles, runs the 150 tests, validates schemas, checks ADR is exactly 2 pages, regenerates workflows and asserts zero drift, then prints the deliverable matrix as a final report. No network, no cloud, no admin.

Expected last line: `EVALUATE: 150 tests passed; ADR=2 pages; zero workflow drift; deliverable matrix below.`

---

## 15-minute live demo path

[docs/DEMO.md](docs/DEMO.md) — three acts:

| Act | Beat | What it proves |
|---|---|---|
| 1. Adoption (5 min) | `dx init` + `dx governance apply` | 5-command adoption; ruleset live on the fork |
| 2. Failure → Recovery (5 min) | bad branch → hook blocks → fix → `dx pr` opens PR | Convention enforced at submission, not review |
| 3. Telemetry (5 min) | download `dora-events` artifact → `dx dora summarize` | 4 PDF metrics from real CI events |

Demo readiness: [docs/PRE-MERGE-SETUP.md](docs/PRE-MERGE-SETUP.md) lists the 6 preconditions; `bash scripts/demo/preflight.sh` checks them.

> Note: `act2_failure_recovery.sh` mutates local repo state (creates a demo branch, makes commits). `scripts/demo/reset.sh` cleans up. `closing_telemetry.sh` is read-only (just runs `dx dora summarize` against the fixture).

---

## Live evidence

| Artifact | Link |
|---|---|
| PR #1 (full ecosystem) — squash-merged ✅ | https://github.com/drapala/transactionify/pull/1 |
| PR #2 (pnpm cdk → npx cdk fix) — squash-merged ✅ | https://github.com/drapala/transactionify/pull/2 |
| PR #4 (cdk tsc + dora-emit jq fix) — squash-merged ✅ | https://github.com/drapala/transactionify/pull/4 |
| Live ruleset on the fork (id 15575639) | `gh api /repos/drapala/transactionify/rulesets` |
| **Integration pipeline GREEN on main** | https://github.com/drapala/transactionify/actions/runs/24969361226 |
| Latest PR pipeline run (9/9 green) | https://github.com/drapala/transactionify/actions/runs/24969293862 |
| 24-commit Work-ID prose (pre-squash) | `git fetch origin tag v0.1.0-poc && git log --reverse --oneline 7d15122..v0.1.0-poc` — reads as narrative (feat → fix surfacing path). Also at [PR #1 commits](https://github.com/drapala/transactionify/pull/1/commits). |
| Pre-dispatch audit trail | commit `67e5e17` — 3 audit passes consolidated before any implementation commit |

---

## Deliverable matrix (PDF mapping)

| PDF item | Status | Where |
|---|---|---|
| 1.a Python CLI installable via uv | ✅ | `packages/cli/`. `uv tool install --from git+https://github.com/drapala/transactionify.git#subdirectory=packages/cli dx` |
| 1.b TypeScript Framework via pnpm | ✅ | `packages/framework/`. `pnpm add 'github:drapala/transactionify#path:packages/framework'` |
| 1.c Unit tests for each | ✅ | 71 pytest + 79 vitest = 150 total |
| 1.d DORA telemetry logic | ✅ | `dx dora summarize` over `dora-event.schema.json` |
| 1.e Comprehensive README | ✅ | `README.md` (251 lines, replaced upstream) |
| 1.f Usage instructions | ✅ | README §Quickstart + per-stack docs |
| 1.g Inner-Source CONTRIBUTING | ✅ | `CONTRIBUTING.md` (222 lines) |
| 2 ADR PDF (max 2 pages) | ✅ | `docs/ADR/0001-golden-path.pdf` — exactly 2 pages (`pdfinfo` verified) |
| 3.a Local environment | ✅ | `dx local up` + LocalStack; `docs/LOCAL-ENV.md` cites PDF p.4 §3.a verbatim |
| 3.b Pre-push validation | ✅ | Hook installed by `dx init`; same `CHECK_MANIFEST` as CI |
| 3.c Amazon Q AI review | ✅ workflow | Step gated on `vars.AMAZON_Q_REVIEW_ENABLED`; demo requires App install (see PRE-MERGE-SETUP) |
| 3.d Integration pipeline | ✅ live | `.github/workflows/integration.yml` green on main (run 24969361226) |
| 3.e Kiro evidence | ✅ | `.kiro/steering/golden-path.md` + `.kiro/specs/golden-path/{requirements,design,tasks}.md` |

---

## Honest PoC limits

These are **deliberate cuts**, not gaps. Each has a documented evolution path with a time budget. Promising less + naming the gap > promising more + shipping a half-broken version.

| Today (PoC) | Production form | Evolution cost |
|---|---|---|
| `deploy-staging` / `deploy-prod` synth-only | OIDC + per-env AWS roles + real `cdk deploy` | ~1d |
| Bundle attestation | Per-asset via `attest-build-provenance@v2` digest list | ~0.5d |
| `required_signatures` opt-out of default | Opt-in via `.dx.yaml.governance.signed_commits=true` | ~0.5d + GPG/SSH onboarding |
| Q App opt-in (gated on env var) | Org-wide auto-install via Backstage scaffolder | ~1d |
| Go / Clojure / TypeScript adapters are stubs | Real adapters via `RuntimeAdapter` contract | ~2d each |
| Changesets configured; no release workflow wired | `release.yml` with OIDC + npm provenance | ~1d |
| Contract = `openapi-spec-validator` (static) | + Schemathesis `--url <staging>` against deployed sandbox | ~0.5d |

Full Roadmap: [README §Roadmap](README.md#roadmap).

---

## Why this PoC was structured this way (briefest version)

1. **Spec-first, not code-first.** `.kiro/specs/golden-path/{requirements,design,tasks}.md` came before any commit. Every commit cites the ticket; every ticket cites the design section; every design section cites the requirement. The chain IS the artifact.
2. **The platform applies its own rules to itself.** Pre-push hook, ruleset, CI gates — all enforced on this very repo. Six bugs caught at submission and fixed in the same workflow (commits in the audit trail name the surfacing path).
3. **Honest about scope.** `synth-only` deploys + Q opt-in + adapter stubs are explicitly Roadmap items. No hidden gaps.
4. **Single source of truth, structurally enforced.** Cross-import test (`test_workflow_uses_manifest`) asserts the framework reads commands from `CHECK_MANIFEST` byte-for-byte. AST test (`test_workid_single_source`) asserts no module re-inlines the work_id regex.

If anything in the matrix above is unclear, the offline evaluator (`./scripts/evaluate.sh`) is the definitive source — it runs the same checks the table claims and prints a final OK/FAIL.
