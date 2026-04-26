import type { WorkflowStep } from "../renderer";
/**
 * The PR-title work_id check. Reads `subject_pattern` from the GENERATED
 * manifest (single source of truth — same regex dx check work_id uses).
 */
export declare function workIdPrTitleStep(): WorkflowStep;
