/* eslint-disable */
/**
 * AUTO-GENERATED FILE — DO NOT EDIT.
 *
 * Source: packages/shared-schemas/*.schema.json (single source of truth).
 * Regenerate: `pnpm --filter @golden-path/framework codegen`.
 */

/**
 * Raw fact emitted by the platform — pipeline_run | deployment. Aggregated metrics (Deployment Frequency, Lead Time for Changes, Change Failure Rate, MTTR) are derived downstream from these events; they are NOT properties of a single event.
 */
export type DoraEvent = {
  [k: string]: unknown;
} & {
  /**
   * Stable UUIDv7 generated at emission time. The MTTR aggregator joins on this id via recovered_from_failure_id.
   */
  event_id: string;
  schema_version: "1.0.0";
  event_type: "pipeline_run" | "deployment";
  /**
   * Logical service name (matches Backstage catalog-info.metadata.name).
   */
  service: string;
  /**
   * owner/repo — answers WHERE.
   */
  repository: string;
  commit_sha: string;
  /**
   * GitHub username or service account — answers WHO.
   */
  actor: string;
  /**
   * Links the event to its originating ticket — answers WHY.
   */
  work_id: string;
  /**
   * Human-readable summary — answers WHAT (with event_type + service + commit_sha).
   */
  change_summary: string;
  /**
   * Optional free-form reason — supplementary WHY.
   */
  reason?: string;
  outcome: "success" | "failure" | "cancelled";
  /**
   * ISO8601 UTC — answers WHEN (start).
   */
  started_at: string;
  /**
   * ISO8601 UTC — answers WHEN (end).
   */
  finished_at: string;
  /**
   * Where the event was emitted. CI events have additional required fields.
   */
  source?: "ci" | "local" | "manual";
  /**
   * GitHub Actions workflow run id (required when source: ci).
   */
  run_id?: string;
  /**
   * Link to the workflow run (required when source: ci).
   */
  source_url?: string;
  /**
   * ISO8601 UTC — when the commit was authored. Required on deployment events; downstream Lead Time = finished_at - commit_authored_at.
   */
  commit_authored_at?: string;
  /**
   * On deployment events: true when this deploy recovers from a prior failed deploy. Aggregator computes MTTR from rework pairs.
   */
  is_rework?: boolean;
  /**
   * On rework deployment events: the event_id of the prior failed deployment this one recovers from.
   */
  recovered_from_failure_id?: string;
  environment?: "staging" | "prod" | "sandbox";
  /**
   * Optional free-form key/value labels (avoid putting load-bearing audit fields here).
   */
  labels?: {
    [k: string]: string;
  };
};
