import type { WorkflowStep } from "../renderer";
/**
 * Emit a single raw DORA event to artifact `dora-events`. Schema-validated
 * against shared-schemas/dora-event.schema.json before upload — malformed
 * events fail the step instead of being uploaded silently.
 *
 * UUIDv7 generation: Python's stdlib uuid module doesn't ship uuid7() until
 * 3.14. We emit a small inline Python helper that builds a v7 from time +
 * os.urandom (RFC 9562 layout). PoC scope; production would use
 * `pip install uuid-utils` and `from uuid_utils import uuid7`.
 *
 * JSON construction: built via `jq -n --arg ...` so every shell variable is
 * properly escaped (handles quotes, backslashes, newlines in PR titles
 * automatically). Earlier draft used a heredoc which would break on a PR
 * title containing `"` — caught during the post-narrative quality audit.
 */
export interface DoraEmitOptions {
    eventType: "pipeline_run" | "deployment";
    service: string;
    outcomeFromJob: string;
}
export declare function doraEmitStep(opts: DoraEmitOptions): WorkflowStep;
