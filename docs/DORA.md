# DORA — 4 PDF metrics from raw events

Read this file when you want to know **how** `dx dora summarize` computes each of the four metrics the PDF names.

## Sources

- **Schema:** `packages/shared-schemas/dora-event.schema.json` (GP-001).
- **Aggregator:** `packages/cli/src/dx/dora/aggregate.py` (this ticket).
- **Emitter:** the `dora-emit` step in `.github/workflows/{pr,integration}.yml` (GP-007).

The aggregator and the emitter are decoupled: events are facts; metrics are derivations. Putting `deployment_frequency` on a single event would be a category error any data-savvy reviewer would catch immediately.

## The 4 metrics

| PDF metric | Formula |
|---|---|
| Deployment Frequency | `count(event_type=deployment, outcome=success in window) / window_days` |
| Lead Time for Changes | `median(deployment.finished_at - deployment.commit_authored_at)` over successful deployments in window |
| Change Failure Rate | `count(deployment, outcome=failure) / count(all deployment) in window` (0.0 if no deployments) |
| Mean Time to Restore | for each `deployment` with `is_rework: true`, look up the prior deployment by `event_id == recovered_from_failure_id`; mean of `recovery.finished_at - failure.started_at` across resolved pairs; `null` if none |

The integration pipeline always emits `is_rework: false` initially. Rework detection is consumer-side: a future post-processing step (out of PoC scope) flips the flag when a successful deployment lands on the same branch right after a failed one. For the PoC, rework events come from manual edits or tests (the `mixed-failure-recovery.jsonl` fixture has both).

## Window semantics

`--window 7d` filters events to `started_at >= max(finished_at) - 7 days`. Anchoring at `max(finished_at)` (rather than `now()`) makes the metric stable across re-runs against the same JSONL — useful for fixtures and for replaying the artifact downloaded from a CI run that happened hours ago.

## Why this is comparable across stacks

A Python team and a Go team emit the same raw events under the same schema. The same aggregator computes the same four numbers regardless of stack. The platform makes telemetry **structurally comparable**, not policy-comparable.

## What this aggregator does NOT do (out of PoC scope)

- Time-series storage (the JSONL artifact IS the storage)
- Trend analysis / week-over-week deltas
- Cross-repo aggregation (single artifact in, single summary out)
- Rework rate as a 5th metric (rework is a supplementary signal; not promoted)
- Backfilling missing events (garbage in, error out — the loader fails loud)
