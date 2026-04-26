# Live demo — Golden Path PoC

> 15-minute live demonstration of the Golden Path platform applied to the Transactionify integration case study. Three acts: **Adoption**, **Failure → Recovery**, **Telemetry**. Every command is automated under `demo/` so the live run is a narration over a re-runnable script, not improvisation.

**Read [PRE-MERGE-SETUP.md](PRE-MERGE-SETUP.md) before the demo.** It lists the 6 preconditions (gh authed with admin, Q App installed, AMAZON_Q_REVIEW_ENABLED=true, docker running, AWS CLI v2, pdfinfo) so nothing fails on stage.

---

## Demo arc (15 min)

| Time | Act | Beat | What the audience sees |
|---|---|---|---|
| 0:00 | Preflight | `bash demo/preflight.sh` | green checks; environment is reproducible |
| 0:30 | Act 1 — Adoption | Service team installs the platform from a clean clone | `dx init` in 30s; 7-command CLI surface; `.dx.yaml` validates against shared schema |
| 4:00 | Act 1 — Governance | `dx governance apply` against the live fork | `gh ruleset list` shows `golden-path-default` applied; 2-reviewer rule, derived required-checks |
| 6:00 | Act 2 — Failure loop | Bad work_id branch → push blocked by hook | Pre-push fail-fast; *seconds*, not minutes |
| 7:30 | Act 2 — Recovery | Fix branch + commit; `dx pr` opens PR | Local validation passes; PR URL printed; CI starts |
| 10:00 | Act 2 — CI | Watch PR pipeline run on real GitHub | 9 jobs; AI review (Q comment) appears non-blocking; sandbox-verify gates merge |
| 12:00 | Act 3 — Closing | Download `dora-events` artifact; `dx dora summarize` | 4 PDF metrics printed in the terminal; comparable across stacks structurally |
| 14:00 | Wrap | Roadmap honest cuts + InnerSource path | What's synth-only, what evolves, who owns content vs form |

---

## Act 1 — Adoption (5 min)

> **Narrative beat.** "A new service team gets the platform in 5 commands. Convention is enforced at submission, not at review."

```bash
bash demo/act1_adoption.sh
```

What happens, in order:

1. `uv tool install --from git+https://github.com/drapala/transactionify.git#subdirectory=packages/cli dx` — CLI installed isolated, on PATH.
2. `pnpm add -D 'github:drapala/transactionify#path:packages/framework'` — framework as dev dep; types codegened from JSON Schema.
3. `dx init --json` — `.dx.yaml`, PR template, pre-push hook scaffolded. Stack detected: `python + lambda` (cdk.json + src/python/).
4. `pnpm tsx scripts/regenerate-workflows.ts` — `.github/workflows/{pr,integration}.yml` written from the framework generators.
5. `dx governance apply --json` — ruleset `golden-path-default` applied to the fork. `gh api /repos/.../rulesets` shows it live (id 15575639 on `drapala/transactionify`).

**Audience takeaway:** the platform applied its own rules to itself. Not a slide deck.

---

## Act 2 — Failure → Recovery (5 min)

> **Narrative beat.** "The platform makes the wrong path harder than the right path. Convention over Configuration is structural, not aspirational."

```bash
bash demo/act2_failure_recovery.sh
```

What happens:

1. **Wrong branch** — `git checkout -b feature/random` (no Work ID). `git push` triggers pre-push hook → fails with "branch does not match `^(LL|GP)-[0-9]+-[a-z0-9-]+$`". *Seconds*, not minutes.
2. **Right branch** — `dx branch GP-999 "feat: demo recovery"`. Branch `GP-999-feat-demo-recovery` created.
3. **Wrong commit subject** — `git commit -m "[GP-999] feat thing"` (bracketed prefix). `dx check work_id` rejects with the offending SHA + `git rebase -i` fix hint.
4. **Right commit subject** — `git commit -m "GP-999: feat demo recovery"` after rebase.
5. **PR submission** — `dx pr --json`. Local validation runs *before* any `gh` call: branch ✓, commits ✓, PR title ✓. PR opens on GitHub; URL printed.
6. **CI runs.** `gh run watch` shows the 9-job graph: lint → unit-tests → pbt → contract → ai-review (non-blocking) ‖ cdk-synth → sandbox-verify → dora-emit (always).
7. **Amazon Q comment posted.** Q App responds to `/q review` from the workflow's `gh pr comment` step. Async; the workflow does not wait.

**Audience takeaway:** the failure loop is local and fast. Q is a finger-post, not a gate. The 2-reviewer rule still gates merge — that's the actual enforcement.

---

## Act 3 — Telemetry (3 min) + closing

> **Narrative beat.** "DORA across stacks is structurally comparable: same schema, same aggregator, same four numbers."

```bash
bash demo/closing_telemetry.sh
```

What happens:

1. `gh run download <run-id> --name dora-events --dir /tmp/dora-events` — artifact pulled from the PR pipeline run.
2. `dx dora summarize --events /tmp/dora-events.jsonl` — Rich table shows the 4 PDF metrics:
   - Deployment Frequency
   - Lead Time for Changes
   - Change Failure Rate
   - Mean Time to Restore
3. **Same code path as a fixture run.** `dx dora summarize --events packages/cli/tests/fixtures/dora-events/single-success.jsonl` — same output schema, just different numbers. A Python team and a Go team produce identical event shapes; the aggregator is stack-agnostic.

**Closing 60 seconds.** Open `docs/ADR/0001-golden-path.pdf` (2 pages). Walk through:

- **Decisions table** (page 1) — what we rejected and why.
- **Honest trade-offs** (page 2) — synth-only deploys, bundle-level attestation, signed-commits opt-out, Q opt-in. Marked in the README Roadmap, not hidden.
- **InnerSource path** — `docs/adapters/<stack>.md` + `CONTRIBUTING.md`. Bringing Go real costs ~2 days; the platform team writes the contract once, contributors implement against it.

---

## If something fails on stage

Every script runs idempotently and emits the same JSON output as captured under `demo/expected-output/`. If a beat misbehaves:

1. `bash demo/reset.sh` — tears down LocalStack, re-bootstraps the fixture branch on the demo PR, re-applies the ruleset.
2. Skip to the next beat; the narration covers the missing one with the snapshot under `demo/expected-output/<beat>.txt`.
3. If GitHub itself is degraded, point at the recorded `expected-output/` JSONs — they are the artifact even when the live run isn't.

The demo is a re-runnable script, not a stage performance. Drift between live and expected-output is itself a Staff signal — if the script started failing, the platform broke; the audience sees that as transparency, not as a failed demo.

---

## After the demo — what to read

| If the reviewer wants… | Read |
|---|---|
| Architecture + decisions in 2 pages | [docs/ADR/0001-golden-path.pdf](docs/ADR/0001-golden-path.pdf) |
| InnerSource path + adapter contract | [CONTRIBUTING.md](CONTRIBUTING.md) |
| What the ruleset enforces + evolution | [docs/GOVERNANCE.md](docs/GOVERNANCE.md) |
| DORA formulas + comparability claim | [docs/DORA.md](docs/DORA.md) |
| LocalStack offline path | [docs/LOCAL-ENV.md](docs/LOCAL-ENV.md) |
| Spec-first chain (PDF → spec → ticket → commit) | [.kiro/](.kiro/) + [golden-path-tickets/](golden-path-tickets/) |
