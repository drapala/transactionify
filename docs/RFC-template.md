# RFC-NNNN — <Title in active voice, e.g. "Add Rust adapter to RuntimeAdapter registry">

> **Status:** Draft | Proposed | Accepted | Declined | Amended | Withdrawn
> **Author(s):** <name @handle>
> **Date opened:** YYYY-MM-DD
> **Comment period ends:** YYYY-MM-DD (≥ 5 working days from opening)
> **Affected components:** <e.g. `packages/framework`, `packages/cli`, ruleset, schemas>
> **Implementation ticket(s):** <linked after Acceptance, e.g. GP-NNN>

## Summary

One paragraph. What are you proposing? Anyone reading just this paragraph should understand the change at the contract level.

## Motivation

Why does this need to exist? What problem does it solve? Who benefits?

If the motivation is "to follow a best practice" or "to use technology X", you are missing the *concrete* motivation — what *currently fails* or *cannot be done* without this change?

## Detailed design

The substantive section. Be specific:

- What interfaces change? Show the before/after.
- What new files / modules are introduced?
- What configuration is added or removed?
- What is the migration story?
- What does the Day 1 user experience look like? Day 30? Day 365?

Code samples are encouraged. Diagrams welcome (in `docs/RFCs/<rfc>/diagrams/`). API tables welcome.

If your RFC introduces a new convention (e.g. a new `.dx.yaml` field, a new check type, a new ruleset rule), describe how it is enforced — convention, validation, runtime check, or all three.

## Drawbacks

What is the cost? Be honest. Examples:

- Adds N lines of code to the framework's hot path.
- Increases install size by N MB.
- Requires every consumer to know about the new field.
- Couples the framework to library X.
- Will break existing consumers that depend on behavior B.

A drawback you cannot name is a drawback you have not considered.

## Alternatives

For each alternative considered, name it, name *why it was attractive*, and the *specific* reason your proposal is better. Vague "more complex" is not a reason; "doubles the number of modules a contributor needs to understand to add a stack" is.

### Alternative A: <name>

…

### Alternative B: <name>

…

## Open questions

What did you not figure out? What needs platform-team or Trusted-Committer judgment? What do you want comment-period feedback on, specifically?

If your RFC has zero open questions, either you have done exhaustive prior work (great) or you are not surfacing genuine ambiguity (bad). Most non-trivial RFCs have 2-5 open questions.

## Adoption strategy

How does this RFC reach all 10+ teams? Examples:

- Platform team rolls it out behind an opt-in flag for 30 days, then default-on.
- Documented in `CONTRIBUTING.md` + announcement in #platform-eng.
- New default in next major version of the framework; older versions unaffected.
- Mandatory, with migration script committed alongside.

## Future possibilities

What does this enable that we are *not* doing now? Naming these helps reviewers see whether the proposal is consistent with where the platform is heading.

## Unresolved questions

Same as Open questions, but specifically the ones the comment period did not resolve. Lists what is being deferred to a follow-up RFC (with name) vs implementation discretion vs explicit non-goal.

---

## Comment-period record (filled in during review)

> **Reviewer:** @<handle>
> **Concern:** …
> **Author response:** …
> **Resolved?** Yes / No / Pending

Repeat as needed. Keep this in the RFC file (not just in the PR thread) so the historical record survives the PR closure.

## Decision (filled in by Trusted Committer at end of period)

- **Outcome:** Accepted / Declined / Needs revision
- **Decided by:** @<handle> on YYYY-MM-DD
- **Rationale:** …
- **Implementation tracking:** GP-NNN (if Accepted)

---

> **Editing this template:** preserve sections that have content; collapse sections to "N/A — <one-sentence why>" rather than removing headings. Reviewers know the order; deviations cost their time.

> See [ADR-0002](./ADR/0002-rfc-process.md) for the process this template participates in.
