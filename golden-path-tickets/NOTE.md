# Backlog — operational form of `.kiro/specs/golden-path/tasks.md`

> **Source-of-truth from this commit forward:** the YAMLs in this directory.
> **Mirror:** `~/Downloads/golden-path-tickets/` (the candidate's local working copy during pre-dispatch audits). After dispatch, treat the fork's tree as canonical; the Downloads mirror is historical.

## Why this lives in the fork

Each YAML decomposes a Kiro task (`.kiro/specs/golden-path/tasks.md`) into operational form: `paths:`, `gherkin:` acceptance criteria, `validation_commands:`, `out_of_scope:`. Tickets are the *how*; tasks are the *what*; requirements are the *why*.

**Provenance chain in the git log:**

```
[upstream]                                  Initial commit, Added missing IDs, Added pagination
   ↓
[GP-000 spec commit] Kiro SDD foundation     ← .kiro/{steering,specs}/golden-path/*
   ↓
[GP-000 backlog commit] this commit          ← golden-path-tickets/*.yaml
   ↓
[GP-000 ADR/RFC commit] templates            ← docs/{ADR,RFC-template}.md
   ↓
[GP-000 catalog commit] Backstage stub       ← catalog-info.yaml
   ↓
[GP-000 api-collection commit] Bruno         ← docs/api/transactionify.bru
   ↓
[GP-000 implementation] workspace            ← pnpm + uv + .changeset/
   ↓
[GP-001..GP-013] implementation              ← packages/* + fork integration
   ↓
[GP-010 hand] ADR PDF + README + DEMO        ← author writes, pipeline reviews
```

## Editing protocol

1. **A requirement changes** (PDF re-read, evaluation criterion shifts) → edit `requirements.md`, then propagate to `design.md`, then `tasks.md`, then the affected ticket YAML(s). Commit chain reflects the propagation.

2. **A design decision changes** (architectural reconsideration) → edit `design.md`, propagate to affected tickets. ADR-0001 may need an addendum (ADR-0003+).

3. **An operational detail changes** (path rename, validation tweak, gherkin clarification) → edit only the ticket YAML. No spec change required.

4. **You discovered a P0 in audit** → edit the ticket. If the discovery reveals a missing requirement or wrong design, also edit the relevant spec section. Commit message references both: `GP-NNN: fix X (audit P0); refines design.md §Y`.

## Pre-dispatch state

These tickets have been through three pre-dispatch audits:

- Initial trim audit (cut GP-011 stretch, GP-012 test-discipline)
- Second-eyes audit (P0/P1 surfacing)
- Re-analysis with corrections (P0-2 retracted, new P0-5/P0-6/P0-7 surfaced)

All P0s flagged in the audits are addressed in the current YAMLs (P0-1 broken-tests fix in GP-009a; P0-3 pnpm install validation in GP-010; P0-5 Q App endpoint in GP-009c; P0-6 stack detection in GP-003; P0-7 commit_signature removed in GP-008).

## Archived tickets (not in this directory)

Two tickets were cut during audits and live in `~/Downloads/golden-path-tickets/archive/` for historical reference only:

- **GP-011** — `dx agents init` stretch ticket (cut to keep critical path lean).
- **GP-012** — test discipline + typed contracts (cut after audit found the load-bearing demo case false against the real fork; the discipline-check generality survives only as ADR Future Integration #3, the `.dx.yaml.test_discipline.banned_patches` opt-in).
