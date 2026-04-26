---
title: "ADR-0001 — Golden Path: a shared engineering platform for 10+ teams"
date: 2026-04-26
status: accepted
author: João Drapala
---

## 1. Context

10+ full-cycle teams ship independently on AWS. Today each team picks its own tooling, lints, branch conventions, CI shape, and DORA reporting (when they report at all). The cost shows up in three failure modes:

1. **Audit gap.** Without a shared schema, "DORA across the org" is a pivot table of incomparable numbers — a Python team's *deployment* event has different fields than a Go team's. SOC 2 audits require *who/what/when/why* on every change; today this is per-team folklore.
2. **Onboarding cost.** A new hire learns one team's conventions, then unlearns them when rotating.
3. **Platform-as-bottleneck.** Any custom pipeline feature funnels through one team. The platform team becomes the rate-limit.

The challenge: **make convention easier than configuration**, **make telemetry structurally comparable across stacks**, and **avoid the platform team becoming the bottleneck** as the org scales.

## 2. Decision

Ship the **Golden Path** — two distributable packages plus a JSON Schema spine — that every team installs and consumes uniformly:

```
                    ┌───────────────────────────────────┐
                    │   packages/shared-schemas         │  ← JSON Schema spine
                    │   dora-event.schema.json          │     (single source of truth)
                    │   dx-config.schema.json           │
                    └─────────┬─────────────────┬───────┘
                              │                 │
       ┌──────────────────────┴──┐         ┌────┴────────────────────────┐
       │   packages/cli  (uv)    │         │  packages/framework (pnpm)  │
       │   `dx` — 7 commands     │         │  GitHub Actions + CDK       │
       │                         │         │  RuntimeAdapter (4 stacks)  │
       │   CHECK_MANIFEST ───────┼─codegen→│  check-manifest.json (read) │
       └────────────┬────────────┘         └──────────┬──────────────────┘
                    │                                 │
                    └────────┬───────────────┬────────┘
                             ▼               ▼
            ┌───────────────────────────────────────────────┐
            │  Service repo (Transactionify or any team)    │
            │  .dx.yaml + .github/workflows/{pr,integ}.yml  │
            │  ruleset golden-path-default applied (gh API) │
            └───────────────────────────────────────────────┘
```

**Four design principles govern decisions:**

1. **Convention over Configuration** — `dx pr` validates Work ID *at submission* (locally, before any network call), not just at review. The ruleset is server-side (GitHub Rulesets API), not advisory.
2. **Local checks must predict CI** — `dx check` and the CI workflow read commands from the *same* `CHECK_MANIFEST`. When `dx check` exits 0, CI exits 0. Drift is detected by a cross-import vitest case asserting byte-for-byte match between the Python source and the JSON the framework imports.
3. **Platform governs form, teams own content** — ruleset shape, schema, workflow shape, and audit-trail field set are platform-owned. Test content, business logic, per-stack policies (which test runner, which packager) are team-owned. The `RuntimeAdapter` interface is the contract.
4. **Shared telemetry schema is the contract** — every team emits the *same* raw DORA events; the *same* aggregator (`dx dora summarize`) computes the *same* four PDF metrics regardless of stack. Comparability is structural, not policy.

**Decisions explicitly named (and what each rejects):**

| Decision | Rejected alternative | Why |
|---|---|---|
| `service_shape` enum (`lambda \| wheel \| binary`) is REQUIRED in `.dx.yaml` | `service_shape` optional, adapter guesses at runtime | Forces the project to declare packaging intent; runtime guessing breaks at build time, not earlier. |
| `event_id` is UUIDv7, REQUIRED, used as MTTR join key | `commit_sha + started_at` heuristic | UUIDv7 is monotonic + unique by construction; heuristic joins are fragile (deploy retries collide). |
| `is_rework` + `recovered_from_failure_id` (deployment events) capture incidents | `incident_opened` / `incident_closed` event types | A "fix" IS a successful deploy after a failed one; introducing incident events doubles the correlation surface. |
| Required-status-checks **derived** from the regenerated workflow | Hardcoded list of contexts in the ruleset builder | Hardcoded lists go stale silently; derivation makes new blocking jobs auto-protected. |
| Custom 80-LoC YAML renderer (`js-yaml` + `WorkflowPlan` interface) | `github-actions-workflow-ts` (PDF-suggested lib) | Type-safety in this PoC comes from the JSON Schema codegen path (`DoraEvent`, `DxConfig`), not the workflow lib. The renderer is fully tested with vitest snapshots **and** `actionlint` against the produced fixtures. The `WorkflowPlan` interface IS the abstraction; migrating to `github-actions-workflow-ts` is a 2-hour swap. |
| No `dx review` command | Wrap `gh pr review` in a CLI | Reviewals are standardized via the *gate* (server-side ruleset + CODEOWNERS routing + Amazon Q App + PR template), not via a CLI wrapper. The CLI surface stays at 7 commands and the steering doc is the single source. |
| `required_signatures` NOT in the default ruleset | Include it in the default | Solo-author demo merge would be blocked even after 2 reviewers approve, invalidating the very enforcement being demonstrated. Documented as opt-in via `.dx.yaml.governance.signed_commits=true`. |

## 3. Consequences

**(+) Homologation — how 10+ teams adopt both tools.** A team's first 30 seconds with the platform is `uv tool install --from git+…` then `dx init`. The CLI scaffolds `.dx.yaml`, the PR template, and the pre-push hook. The framework lands as a `pnpm add github:…` dev dependency that emits `.github/workflows/{pr,integration}.yml`. Adoption cost is **5 commands** (documented in the README quickstart). Convention is enforced at submission: a non-conformant branch can't be pushed (hook); a non-conformant PR title can't merge (`work-id-pr-title` CI gate); CHECK_MANIFEST drift fails the framework's vitest case. The teams don't *choose* to follow conventions — there is no easy path to break them.

**(+) Scalability — how the platform team avoids becoming the bottleneck.** Three structural answers:

1. **Adapters are not platform code.** Adding Go support is a `~30-line packages/framework/src/adapters/go.ts` + a 1-page doc. The 4-stack registry resolves all PDF stacks today; the platform team writes the contract once, contributors implement against it.
2. **Custom pipeline steps via `custom_steps:` escape hatch.** `.dx.yaml.custom_steps` is a documented array of `{name, run, stage}` — services splice extra steps into the generated workflow without forking the generator.
3. **InnerSource path is documented.** [`CONTRIBUTING.md`](../../CONTRIBUTING.md) routes new stack adapters, CHECK_MANIFEST changes, and pipeline stages through clear flows with bounded time budgets (1–2 days). RFCs are required only for changes that cross the platform boundary (new schema field, new command group). The platform team reviews the form; teams own the content.

**(+) Shift-Left strategy.** Defects detected at every layer earlier than the next:

- **Pre-commit (work_id, lint via pre-push hook installed by `dx init`):** seconds. Bad branch name never leaves the laptop.
- **Local (`dx check`):** seconds. Same code path as CI; if local is green, CI is green.
- **PR open (CI gates):** minutes. `lint → unit → pbt → contract → cdk-synth → sandbox-verify`. AI review (Amazon Q via comment-trigger) runs early after `contract`, non-blocking — opinion now, not after merge.
- **Schema-level (jsonschema):** structural. A malformed DORA event fails `dora-emit` before upload; a malformed `.dx.yaml` fails `dx check` before push.

**(−) Trade-offs we accept (honestly).**

- **Synth-only deploys at PoC fidelity.** `deploy-staging` and `deploy-prod` run `cdk synth` against stub account ids, not real `cdk deploy`. The structural shape (build → attest → staging → prod with manual approval gates) is the production-true shape; only the deploy mechanics are placeholders. Real deploy needs OIDC + per-environment AWS roles + `aws-actions/configure-aws-credentials@v4` (~1d of work). **We mark this in the README Roadmap rather than hide it behind red CI.**
- **Bundle-level attestation.** `actions/attest-build-provenance@v1` covers a single `service-package.tgz` (the `cdk.out/` synth output). CDK actually deploys per-asset zips; per-asset attestation via `attest-build-provenance@v2`'s digest list is the documented evolution path. The bundle attestation is **honest about what it covers** — it is not claimed to be "what gets deployed".
- **Required signatures off by default.** The PoC demo's commits aren't GPG/SSH-signed; including the rule would block the very merge being demonstrated. Opt-in via the existing `signedCommits: true` flag on the ruleset builder; org-level rollout uses GitHub's `enforcement: "evaluate"` mode first to surface gaps before promoting to active.
- **Amazon Q App is opt-in.** The workflow's `gh pr comment /q review` step is gated on `vars.AMAZON_Q_REVIEW_ENABLED == 'true'`. Without the App installed and the variable set, the step no-ops cleanly. GP-009c's preflight emits `INFO:` (not `ERROR`) when Q is missing — surfaced, not swallowed.
- **Mocks of the database are forbidden in service tests.** Pre-dispatch audit P0-1: previous tests mocked `services.transaction.query_by_pk` after upstream renamed it `query_by_pk_paginated`; the mocks drifted silently. Discipline encoded in CONTRIBUTING.md.

**(−) Limits acknowledged in the audit trail.** Three pre-dispatch audit passes (commit `67e5e17`) ranked 14 issues P0/P1/P2 before any implementation commit landed. The Roadmap section of the README surfaces every P0/P1 mitigation publicly. The cost of being honest is non-zero (the reviewer sees the gaps); the cost of hiding them is reputational when discovered.

**(=) Provenance chain.** PDF requirements → `.kiro/specs/golden-path/{requirements,design,tasks}.md` → `golden-path-tickets/<id>.yaml` → code commits (`<work-id>: <description>`). Every commit traces back to a ticket; every ticket cites the design section it implements; every design section cites the requirement it satisfies. The chain is the artifact. The code is the test that the chain is real.

---

**See also:** [README](../../README.md) · [CONTRIBUTING](../../CONTRIBUTING.md) · [GOVERNANCE](../GOVERNANCE.md) · [DORA](../DORA.md) · [steering](../../.kiro/steering/golden-path.md)
