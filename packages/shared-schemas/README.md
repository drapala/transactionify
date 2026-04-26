# `@golden-path/shared-schemas`

JSON Schema contracts consumed by both `packages/cli` (Python) and `packages/framework` (TypeScript). **This package is the source of truth.** Both consumers read these `.json` files directly; the framework additionally codegens TypeScript types from them in GP-005.

## Schemas

### `dora-event.schema.json` — DORA raw event (v1)

Raw facts emitted by the platform. **Aggregated metrics are NOT properties of a single event** — they are derived downstream over time windows. Putting `deployment_frequency_per_week` on an event would be a category error.

#### Mapping (downstream, out of scope here)

The 4 canonical DORA metrics derive as:

| Metric | Derivation |
|---|---|
| Deployment Frequency | `count(event_type=deployment, outcome=success) / window` |
| Lead Time for Changes | `mean(finished_at - commit_authored_at)` over deployment events |
| Change Failure Rate | `count(deployment, outcome=failure) / count(deployment)` |
| MTTR (Time to Fix) | for each `is_rework: true` deployment, find the deployment whose `event_id == recovered_from_failure_id`; mean of `recovery.finished_at - failure.started_at` |

Optional supplementary signal (NOT canonical DORA):
- Deployment rework rate = `count(is_rework=true) / count(deployment)`

#### Audit-trail field set (PDF SOC2 requirement)

| Question | Field(s) | Required? |
|---|---|---|
| WHO | `actor` | yes |
| WHAT | `event_type`, `service`, `commit_sha`, `change_summary` | yes |
| WHEN | `started_at`, `finished_at` (ISO8601 UTC) | yes |
| WHY | `work_id`, `change_summary`, `reason` (last is optional) | yes |
| WHERE | `repository`, `run_id`, `source_url` (last two for `source: ci`) | yes (conditional) |

The schema's `additionalProperties: false` prevents quietly adding unstandardized fields. Extending the event vocabulary requires v2.

### `dx-config.schema.json` — `.dx.yaml`

Per-service config consumed by `dx init`, `dx check`, and the framework's workflow renderer.

Required: `project`, `stack`, `service_shape`. The `service_shape` enum (`lambda | wheel | binary`) forces the project to declare packaging intent rather than the adapter guessing at runtime.

## Why no `incident_*` event types in v1

The PDF asks for MTTR ("Time to Fix"). The simpler model: a "fix" IS a successful deployment that recovers from a prior failed one. `is_rework` + `recovered_from_failure_id` capture this directly. Adding incident lifecycle events would (a) introduce another correlation key, (b) require teams to instrument on-call tooling, (c) duplicate signal already in the deployment stream. Out of PoC scope.

## Validation

```bash
uv run pytest packages/shared-schemas/tests/test_schemas.py -v
```
