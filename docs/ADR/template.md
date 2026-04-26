# ADR-NNNN — <Decision title>

> **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-MMMM
> **Date:** YYYY-MM-DD
> **Deciders:** <names or roles>
> **Tags:** <e.g. `cli`, `framework`, `governance`, `dora`>

## Context

What is the problem we are solving? What forces are at play (technical, organizational, regulatory)? What constraints apply? What is the trigger that made this decision urgent now?

Keep this section to 2-4 paragraphs. If it requires more, you are probably writing a design doc, not an ADR — split.

## Decision

We will **<verb in active voice>** to **<the chosen approach>**.

Be specific. "We will use library X version Y configured with option Z" beats "We will adopt a logging solution".

If the decision affects an interface or a contract, link to the spec section in `.kiro/specs/golden-path/design.md`.

## Consequences

### Positive

- <observable benefit, ideally measurable>
- <…>

### Negative

- <real cost, not "minor inconvenience" — be honest>
- <…>

### Neutral but worth naming

- <e.g. "future contributors will need to learn library X">
- <…>

## Alternatives considered

For each alternative, state what it was, why it was attractive, and the *specific* reason it was not chosen. "Was not chosen" without a specific reason is not an alternative — it is a name on a list.

### Alternative 1: <name>

- **Why attractive:** …
- **Why not chosen:** …

### Alternative 2: <name>

- **Why attractive:** …
- **Why not chosen:** …

## Migration / Rollout

How does the existing code/workflow/process move to the new state? Is there a flag-gated rollout? A backwards-compatibility shim? A deprecation window?

If "no migration needed" — say so explicitly and briefly explain why.

## References

- [link to spec section, e.g. `.kiro/specs/golden-path/design.md` §N]
- [link to relevant ticket, e.g. `golden-path-tickets/GP-NNN-…yaml`]
- [external references: RFCs, blog posts, library docs, prior art]

---

> **Editing this template:** preserve the section ordering. Reviewers know where to look. If a section does not apply, write "N/A — <one sentence why>" rather than removing the heading.
