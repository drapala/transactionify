/**
 * Public surface of @golden-path/framework.
 *
 * Concrete pipeline shape lands in GP-007 (workflow generator) and GP-006
 * (RuntimeAdapter). This package's responsibility at GP-005 time is the
 * renderer + the codegened types.
 */
export { render } from "./workflows/renderer";
export type {
  WorkflowPlan,
  WorkflowJob,
  WorkflowStep,
  WorkflowTrigger,
} from "./workflows/renderer";
export type { DoraEvent } from "./types/dora-event";
export type { DxConfig } from "./types/dx-config";
