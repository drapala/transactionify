# ADR-0002 — Inner-Source RFC process for cross-cutting changes

> **Status:** Proposed (placeholder — accepted on first non-trivial RFC submission)
> **Date:** 2026-04-26
> **Deciders:** Platform team (currently: solo author; multi-engineer once the team scales per ADR-0001 Consequence (a))
> **Tags:** `governance`, `inner-source`, `process`

## Context

ADR-0001 declares that the Golden Path platform team should not become a bottleneck for custom pipeline features (PDF: Scalability evaluation criterion). To make this real, contributors from other teams need a discovery + decision path that does not require synchronous platform-team review for every change.

Without a structured process:

- Contributors hesitate to propose changes (uncertainty about acceptance criteria).
- Platform team becomes the bottleneck via informal review of slack messages and PRs.
- Decisions get made implicitly in PR comments, lost when the PR closes.
- New teams cannot tell what the platform team *will* accept vs *will not*.

## Decision

We will **adopt a lightweight RFC process** for changes that are cross-cutting (affect more than one package), introduce new conventions, change the `RuntimeAdapter` interface, modify the default ruleset, or otherwise affect more than one team.

The process:

1. **Author** writes an RFC using `docs/RFC-template.md`. PRs the file to `docs/RFCs/<number>-<slug>.md` with status `Proposed`.
2. **Comment period** of at least 5 working days. Anyone can comment in the PR. The platform team responds to each comment.
3. **Decision** is one of: `Accepted` (merge with status update), `Declined` (close with rationale in the PR), `Needs revision` (push back to author with specific asks). The platform team's Trusted Committers are the deciders; ties are broken by the platform tech lead.
4. **Implementation** proceeds via standard Work-ID-tagged tickets after Acceptance. The RFC link is referenced in the implementation ticket.
5. **Retrospective** if the RFC's promise materially changes during implementation: the RFC author or implementer files an addendum (status `Amended`) before merging the implementation.

Changes that do **not** require an RFC:

- Bug fixes scoped to a single package (use the standard ticket).
- New stack adapters following the documented `RuntimeAdapter` contract (use `docs/adapters/<stack>.md`).
- Adding a new check that fits the existing `CHECK_MANIFEST` shape.
- Documentation updates.

When in doubt, file the RFC. Over-process for a small change is correctable; under-process for a cross-cutting change is not.

## Consequences

### Positive

- Other teams have a predictable path from "I have an idea" to "merged change" without ad-hoc platform-team availability.
- Decisions are durable artifacts, searchable in `docs/RFCs/`.
- The platform team can scale: new Trusted Committers learn the bar by reading prior RFCs.
- Contribution friction is calibrated to change scope (small changes are fast; cross-cutting changes are deliberate).

### Negative

- Adds a documentation step. Authors who want to contribute and run away may bounce.
- 5-day comment period creates a floor on lead-time for cross-cutting changes. (Counter: cross-cutting changes should not be hot-fixes.)
- Until the platform team is multi-person, the "Trusted Committers" are one person; the process is a formality. (Counter: writing the formality now means the multi-person regime inherits it; it is also what makes Inner-Source readiness verifiable to contributors.)

### Neutral but worth naming

- New contributors will need to learn the RFC template. A README link from `CONTRIBUTING.md` mitigates.
- Some RFCs will be declined; the RFC artifact itself documents *why*, useful for future authors with similar ideas.

## Alternatives considered

### Alternative 1: No formal process — contributors PR directly

- **Why attractive:** zero process overhead, fastest path to merge for trivial changes.
- **Why not chosen:** PRs that propose cross-cutting changes get tangled with implementation specifics; review degenerates into design negotiation in code-review threads. Decisions made there are not discoverable to other teams.

### Alternative 2: Linear/Jira ticket-as-RFC

- **Why attractive:** existing tooling, threaded comments, status fields out of the box.
- **Why not chosen:** RFCs are durable artifacts of *decisions*, not work-tracking items. Living next to the code (`docs/RFCs/`) means the historical reasoning is alongside the code that implements it; ticket trackers archive old items and search is poor.

### Alternative 3: Architecture Review Board with weekly sync

- **Why attractive:** dedicated time for cross-team decisions.
- **Why not chosen:** synchronous bottleneck — exactly what we are avoiding. Async written process scales; meetings do not.

## Migration / Rollout

This ADR is a **placeholder** until the first non-trivial RFC is submitted. Acceptance flips to `Accepted` at that point. Until then, the process is documented but not yet exercised — same way `docs/RFC-template.md` exists before `docs/RFCs/0001-…md` does.

## References

- `docs/RFC-template.md` — the template authors use
- `docs/ADR/template.md` — the ADR template (this file's parent template)
- `CONTRIBUTING.md` — links to this ADR + the RFC template (will be authored as part of GP-010)
- ADR-0001 — names this process as the answer to PDF Scalability evaluation criterion
- InnerSource Commons patterns: Trusted Committer, Explicit Governance Levels, RFCs ([https://innersourcecommons.org/learn/learning-path/innersource-patterns/](https://innersourcecommons.org/learn/learning-path/innersource-patterns/))
