# Golden Path — DevEx Platform Steering

> Read me first. This file is the system prompt for any agent (Q Developer, Claude, Cursor, Cline, Aider) operating on this repo. It is short on purpose. Specs in `.kiro/specs/golden-path/` carry the detail.

## What this repo is

A fork of [rrgarciach/transactionify](https://github.com/rrgarciach/transactionify) that hosts a **Proof of Concept** for a shared engineering platform — the **"Golden Path"** for 10+ independent, full-cycle teams. The platform consists of:

- `packages/cli/` — `dx`, the developer-facing Python CLI (Typer + Rich), distributed via `uv`.
- `packages/framework/` — the TypeScript framework that produces GitHub Actions workflows + CDK patterns, distributed via `pnpm`.
- `packages/shared-schemas/` — JSON Schema contracts (`dora-event.schema.json`, `dx-config.schema.json`) consumed by both CLI and framework.

The reference service (`src/python/transactionify/` + `lib/transactionify-stack.ts`) is the **Integration Case Study** the platform is dogfooded against.

## How this repo is built

**Spec-driven, not code-first.** Read in order:

1. `.kiro/specs/golden-path/requirements.md` — what we are building, in EARS notation, derived from the challenge PDF.
2. `.kiro/specs/golden-path/design.md` — architecture, components, data flow, decisions, and trade-offs explicitly named.
3. `.kiro/specs/golden-path/tasks.md` — the 15 active tasks that decompose the design into shippable work.
4. `golden-path-tickets/*.yaml` — the operational form of the tasks, one YAML per ticket, with `gherkin:` acceptance criteria, `paths:`, `validation_commands:`, `out_of_scope:`. Edit these when the operational shape of work changes; edit specs when the *what* or the *why* changes.

**Provenance:** PDF → `requirements.md` → `design.md` → `tasks.md` → `golden-path-tickets/<id>.yaml` → code commits. Each commit subject carries a Work ID (`GP-NNN: …`) that tracks back to a ticket; each ticket references the design section it implements; each design section references the requirement it satisfies.

## Conventions (enforced, not suggested)

- **Work ID format:** `^(LL|GP)-[0-9]+$` (extracted by `CHECK_MANIFEST.work_id.extract_pattern`).
- **Branch names:** `<work-id>-<dash-joined-slug>` — e.g. `GP-123-feat-add-validator`. Pattern: `^(LL|GP)-[0-9]+-[a-z0-9-]+$`.
- **Commit subjects:** `<work-id>: <description>` — e.g. `GP-123: feat add validator`. Pattern: `^(LL|GP)-[0-9]+: .+$`. NO brackets, NO `[GP-123]` square prefix.
- **PR titles:** same shape as commit subjects (`<work-id>: …`).
- **One mental model across all three contexts.** Branches use dashes (filesystem-safe); commits and PR titles use colons (human-readable). The Work ID itself is the same regex everywhere.

## Design Principles (the 4 that govern decisions)

1. **Convention over Configuration** — easier to follow the rule than to break it. Work ID is enforced at *submission* (`dx pr` validates before any network call), not just at review. Ruleset is server-side (GitHub Rulesets API), not advisory.
2. **Local checks must predict CI** — `dx check` and the CI workflow read commands from the *same* `CHECK_MANIFEST` (Python dict in `packages/cli/`, codegened to JSON consumed by the TS framework). When `dx check` exits 0, CI exits 0.
3. **Platform governs form, teams own content** — ruleset, schemas, workflow shape, and audit-trail fields are platform-owned. Test content, business logic, and per-stack policies are team-owned. The `RuntimeAdapter` interface is the contract.
4. **Shared telemetry schema is the contract** — every team emits the same raw DORA events (`dora-event.schema.json`); the same aggregator (`dx dora summarize`) computes the 4 PDF metrics regardless of stack. Comparability is structural, not policy.

## CLI surface (7 commands)

| Command | Purpose |
|---|---|
| `dx init` | Scaffold `.dx.yaml` + PR template + pre-push hook (work_id + lint). |
| `dx check` | Run lint, unit, PBT, contract, work_id checks locally — same code path as CI. |
| `dx branch <work-id> "<title>"` | Create a Work-ID-conformant branch. |
| `dx pr` | Submit PR with Work-ID-conformant title; validates branch + commits + title locally BEFORE any network call. |
| `dx local up` / `dx local down` | LocalStack + seeded DynamoDB for dependency-emulating tests without cloud round-trips. |
| `dx governance apply` | Apply the platform's GitHub ruleset (2-reviewer, required status checks, deletion + non-fast-forward) idempotently. |
| `dx dora summarize --events <jsonl>` | Compute Deployment Frequency, Lead Time for Changes, Change Failure Rate, MTTR from raw events JSONL. |

`--json` flag is supported on every command; output is structured, parseable. Pre-push hook installation is part of `dx init` — there is **no** `dx hooks install` command.

There is **no `dx review`** command. Reviewals are standardized via the *gate* (server-side ruleset + CODEOWNERS routing + Amazon Q App + PR template), not via a CLI wrapper. See ADR Consequence (e).

## Polyglot stance (PDF requirement)

The framework's `RuntimeAdapter` registry resolves all four PDF-named stacks: `python`, `go`, `clojure`, `typescript`. **Python is real**; Go/Clojure/TypeScript are stubs that throw `NotImplementedError` with instructive error messages pointing to per-stack docs (`docs/adapters/<stack>.md`). The contract is documented; bringing each stub real costs ~2d of work via the documented interface.

## When you (the agent) edit this repo

- **Specs change → tasks change → tickets change → code changes.** Honor the chain. If you find code-vs-spec drift, raise it in a comment on the ticket; do not silently update the ticket to match drifted code.
- **Never mock the database in service tests** — `moto` (DynamoDB) or LocalStack-backed integration tests only. Mocks at the module-level (`@patch('services.transaction.query_by_pk')`) caused P0-1 of the pre-dispatch audit because patches drifted from upstream renames.
- **Never set `AWS_DEFAULT_REGION` inside production code.** It must come from CI env (workflow-level `env:`) or developer shell (`export AWS_DEFAULT_REGION=us-east-1`). The boto3 module-level singleton in `tools/aws/dynamodb/__init__.py` reads this; production code stays clean.
- **Never use `\|\| true` or `\|\| echo …` in validation commands.** Failures must propagate. Pre-dispatch audit P0-3 was a `\|\| echo` swallowing a broken pnpm install path; do not regress.
- **Always cite the requirement.** If you implement something not traceable to `requirements.md`, either add the requirement first (with rationale) or do not implement it. Inflated scope = lower Staff signal.

## When in doubt

- Read `requirements.md` for *what*.
- Read `design.md` for *why*.
- Read `tasks.md` + the corresponding `golden-path-tickets/<id>.yaml` for *how*.
- Run `dx check` to verify your change doesn't break the platform's own conventions.
- If something is genuinely ambiguous, write an RFC using `docs/RFC-template.md` and link it from the ticket. Do not guess.
