# Contributing to the Golden Path

> **Inner-Source contract.** This platform is owned by the platform team but evolves through contributions from every service team. The platform owns *form*; teams own *content*. This file is the contract for proposing changes without hand-holding.

---

## TL;DR — choose your path

| You want to… | Where to start | Estimated time |
|---|---|---|
| Add a new stack adapter (Go, Clojure, TypeScript, Rust…) | [§Adding a stack adapter](#adding-a-stack-adapter) | 1–2 days |
| Change a CHECK_MANIFEST entry (lint cmd, test cmd, regex) | [§Changing CHECK_MANIFEST](#changing-check_manifest) | 0.5–1 day |
| Add a new pipeline stage to the PR or integration workflow | [§Adding a pipeline stage](#adding-a-pipeline-stage) | 0.5–1 day |
| Propose a larger architectural change (new schema field, new command group) | [§Proposing an RFC](#proposing-an-rfc) | varies |
| Fix a bug in the platform | [§Bug fix flow](#bug-fix-flow) | hours |

If your change doesn't fit any of the above, open a draft PR and ask. Confused contributors are a platform bug, not a team-skill issue.

---

## Conventions (enforced, not suggested)

These are the same conventions the platform enforces on every service repo. The platform applies them to itself.

- **Work ID format:** `^(LL|GP)-[0-9]+$`. `LL-` for service-level work, `GP-` for platform work. Same regex everywhere.
- **Branch names:** `<work-id>-<dash-joined-slug>` — e.g. `GP-123-feat-add-go-adapter`.
- **Commit subjects:** `<work-id>: <description>` — e.g. `GP-123: feat add go adapter`. **No brackets.**
- **PR titles:** same shape as commit subjects (`<work-id>: …`). The CI step `work-id-pr-title` validates this against the same regex `dx check work_id` validates locally.

The regex lives in **one place**: `packages/cli/src/dx/checks/manifest.py` (`CHECK_MANIFEST.work_id`). The framework reads from the JSON copy emitted by `python -m dx.checks.manifest_codegen`. An AST test (`packages/cli/tests/test_workid_single_source.py`) fails CI if any module re-inlines or dynamically reconstructs the regex. Don't fight this — there is no second place.

---

## Adding a stack adapter

The `RuntimeAdapter` interface is the polyglot contract. The registry resolves all four PDF-named stacks (`python`, `go`, `clojure`, `typescript`); only `python` is real today. To make a stub real:

### 1. Read the per-stack doc

Each stub ships a 1-page doc that lists the suggested commands the adapter SHOULD return:

- [`docs/adapters/go.md`](docs/adapters/go.md)
- [`docs/adapters/clojure.md`](docs/adapters/clojure.md)
- [`docs/adapters/typescript.md`](docs/adapters/typescript.md)

These commands are **starting points, not platform mandates**. The platform owns the *shape* (5 methods, structured `{cmd, args, cwd?}`); teams own the *content* (which test runner, which packager). See ADR §Decisions.

### 2. Implement the interface

```ts
// packages/framework/src/adapters/<stack>.ts
import type { RuntimeAdapter, AdapterCommand } from "./runtime-adapter";
import type { DxConfig } from "../types/dx-config";

export class GoAdapter implements RuntimeAdapter {
  readonly stack = "go" as const;
  lintCommand(_c: DxConfig): AdapterCommand     { return { cmd: "go",  args: ["vet", "./..."] }; }
  unitTestCommand(_c: DxConfig): AdapterCommand { return { cmd: "go",  args: ["test", "./..."] }; }
  pbtCommand(_c: DxConfig): AdapterCommand      { return { cmd: "go",  args: ["test", "-tags=pbt", "./..."] }; }
  contractCommand(_c: DxConfig): AdapterCommand { return { cmd: "schemathesis", args: ["run", "openapi.yaml", "--checks=all"] }; }
  packageCommand(_c: DxConfig): AdapterCommand  { return { cmd: "go",  args: ["build", "-o", "bin/service", "./cmd/service"] }; }
}
```

Drop the `NotImplementedError` import + `fail()` shim. The registry already resolves your stack — no registry change needed.

### 3. Add tests

Mirror `packages/framework/test/adapters/python.test.ts`. Five command checks + one `service_shape`-aware case if your adapter accepts shapes other than `binary`.

### 4. Update the doc

Change the doc's status header from "STUB" to "real". Document any conventions specific to your stack (e.g. "PBT tests are selected by the build tag `pbt`"; "packageCommand for `service_shape: lambda` runs `provided.al2` bootstrap zip"). Keep it ≤1 page.

### 5. Add a `.dx.yaml` example

In the doc, show the minimal config a service team writes:

```yaml
project: my-go-service
stack: go
service_shape: binary   # or lambda when adapter supports it
```

### 6. Open a PR

Branch: `LL-NNN-feat-go-adapter` (or `GP-NNN-…` if you're on the platform team). PR title: `LL-NNN: feat add Go adapter (real)`. Reviewer is the platform team via CODEOWNERS.

**Time budget:** 1–2 days. If yours takes longer, the contract is wrong — open an issue and we fix the contract.

---

## Changing CHECK_MANIFEST

`CHECK_MANIFEST` is the single source of truth for check commands and the Work ID regex set. Two consumers read from it:

1. **Python**: `dx check`, `dx branch`, `dx pr` import the dict directly.
2. **TypeScript**: `packages/framework/` reads `packages/framework/src/generated/check-manifest.json` (codegened from the Python source).

To change a command:

1. Edit `packages/cli/src/dx/checks/manifest.py`.
2. Regenerate the JSON copy:
   ```bash
   uv run python -m dx.checks.manifest_codegen --out packages/framework/src/generated/check-manifest.json
   ```
3. Run the framework tests:
   ```bash
   pnpm --filter @golden-path/framework test packages/framework/test/workflows/
   ```
   The cross-import test (`test_workflow_uses_manifest`) verifies the framework's emitted YAML matches the manifest **byte-for-byte**. If a step's `run` command no longer matches `cmd + args` from the manifest, the test fails with a clear diff.
4. Regenerate workflow fixtures (their `run` strings come from the manifest):
   ```bash
   pnpm --filter @golden-path/framework run gen-fixtures
   git diff packages/framework/test/fixtures/
   ```
5. If the manifest change affects the regex set (`work_id.{branch_pattern, subject_pattern, extract_pattern}`), the AST test (`test_workid_single_source.py`) automatically picks it up — no extra step.
6. Commit subject: `<work-id>: <verb> CHECK_MANIFEST <field>` (e.g. `LL-42: update CHECK_MANIFEST.lint.args to ruff check . --output-format=concise`).

**Drift mode is zero.** If you commit a manifest change without regenerating the JSON, CI fails with `git diff --exit-code` on the generated file. Don't try to game this; the lock is structural.

---

## Adding a pipeline stage

Stages are step-builder functions consumed by `pr-pipeline.ts` or `integration-pipeline.ts`.

1. **Add the step builder.** New file: `packages/framework/src/workflows/steps/<my-step>.ts`. Export a function returning `WorkflowStep` (see `lint.ts` or `cdk-synth.ts` for the shape).
2. **Compose into a job.** Edit `pr-pipeline.ts` or `integration-pipeline.ts`. Decide:
   - Does the job block merge? (no `continue-on-error`, no `if: always()`)
   - Does it need `AWS_DEFAULT_REGION: us-east-1` at job-level? (Yes if it imports the production code that touches boto3 — see [GP-007](golden-path-tickets/GP-007-workflow-generator.yaml).)
   - What does it `needs:`?
3. **Regenerate fixtures.** `pnpm --filter @golden-path/framework run gen-fixtures`. The vitest snapshot test fails until you commit the new fixture — that is intentional; the fixture is the demo's visual story.
4. **Run actionlint locally.** `actionlint packages/framework/test/fixtures/expected-pr-pipeline.yml`. The CI runs the same check; failing locally first saves a round-trip.
5. **If the new job is blocking, the ruleset auto-protects it.** `extractBlockingJobsFromWorkflow` reads the YAML and emits the actual job names. No separate ticket to update the protected list.

Tests: a new vitest case asserting the job exists, has the right `needs:`, and (if blocking) is in the ruleset's `required_status_checks` list.

---

## Proposing an RFC

If your change is bigger than a single command or stage — for example, "add a fifth DORA metric", "change the Work ID regex", "introduce a new schema version" — write an RFC first.

1. Copy [`docs/RFC-template.md`](docs/RFC-template.md) to `docs/RFC/<NNNN>-<slug>.md`.
2. Fill in: Context, Decision, Consequences, Rejected Alternatives. **Name the trade-offs explicitly** — RFCs that omit "what we sacrifice" are not RFCs, they are sales pitches.
3. Open a draft PR with the RFC alone. Get a soft review. Iterate.
4. When the RFC is accepted, the implementation PR cites it (`see RFC-NNNN`) in the commit body.
5. Some accepted RFCs will produce a corresponding [ADR](docs/ADR/) when the decision is durable.

ADR-0002 (RFC process placeholder) sketches the lifecycle.

---

## Bug fix flow

Bugs in the platform follow the same Work ID discipline as features.

1. Open an issue (or a ticket in `golden-path-tickets/`) describing the failure mode and the smallest reproducer.
2. Branch: `<work-id>-fix-<slug>`.
3. Write the failing test FIRST. The platform's spec-first chain ([requirements.md](.kiro/specs/golden-path/requirements.md)) says: code that doesn't trace to a requirement either gets the requirement added (with rationale) or doesn't ship.
4. Fix the bug.
5. Update [`docs/audit-trail.md`](docs/audit-trail.md) only if the fix invalidates a documented audit decision.

---

## Code review expectations

CODEOWNERS routes every PR to the platform team for paths under `/packages/`, `/.kiro/`, `/golden-path-tickets/`, `/docs/ADR/`, `/scripts/`, `/.github/`. The two-reviewer rule is enforced via the `golden-path-default` ruleset (see [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md)).

Reviewers will look for:

- **Provenance.** Does the commit subject have a Work ID? Does the change cite a ticket / RFC / requirement?
- **No drift.** Did you regenerate `check-manifest.json` if you changed `CHECK_MANIFEST`? Did you run `gen-fixtures` if you touched the workflow generator?
- **Tests at the right layer.** Schema → test the schema. Aggregator → test pure functions. CLI → test via Typer's `CliRunner`. Workflow → vitest snapshot **and** actionlint.
- **Honesty about scope.** If the change is "synth-only at PoC fidelity", say so in the commit body. Hidden gaps are the failure mode.
- **No mocks of the database** in service-side tests. Use `moto` (DynamoDB) or LocalStack-backed tests. Mocks at the module level (`@patch('services.transaction.query_by_pk')`) caused P0-1 of the pre-dispatch audit (the patch drifted from the upstream rename); we won't accept new ones.
- **No `\|\| true` / `\|\| echo …` swallowing failures** in validation commands or CI scripts. P0-3 of the audit.

The Amazon Q App posts an automated review on PR open (gated on `vars.AMAZON_Q_REVIEW_ENABLED == 'true'`). Q is a finger-post, not a gate (`continue-on-error: true`); it never blocks merge by itself.

---

## Local development

```bash
# Bootstrap (one-time per clone).
pnpm install
uv sync --all-packages
uv tool install --editable packages/cli   # puts `dx` on PATH

# Run all tests.
uv run pytest                              # CLI + integration tests
pnpm --filter @golden-path/framework test  # framework tests + drift detector
bash tests/workspace/test_workspace_health.sh

# Bring up local dependencies (LocalStack DynamoDB).
dx local up
# … work on the change …
dx local down
```

The pre-push hook (installed by `dx init`) runs `dx check work_id` then `dx check lint` before every push. This is the same code path CI runs — local green ≈ CI green.

---

## Style

- **Python:** ruff (E + F + I rules); `uv run ruff check .` at repo root must pass.
- **TypeScript:** strict TS (`tsc --strict`); prettier on save.
- **Markdown:** the platform writes plain prose. No emojis in commit messages or doc titles.
- **Comments explain *why*, not *what*.** Code shows what; comments justify the trade-off.

---

## When in doubt

1. Read [`.kiro/steering/golden-path.md`](.kiro/steering/golden-path.md) — it is the system prompt for any agent working on this repo, and it doubles as a 70-line summary of platform conventions.
2. Read the relevant ticket: [`golden-path-tickets/<id>.yaml`](golden-path-tickets/) carries `gherkin:`, `paths:`, `validation_commands:` — concrete, not aspirational.
3. Open a draft PR. Mark it `WIP: <work-id>: <thing you're attempting>`. Comment with your plan. The platform team will respond before you write significant code in the wrong direction.

The cost of asking is small. The cost of building a feature that doesn't fit the contract is the contributor's afternoon AND the reviewer's. Don't optimize for the wrong one.
