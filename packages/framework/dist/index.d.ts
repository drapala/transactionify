/**
 * Public surface of @golden-path/framework.
 *
 * Concrete pipeline shape (PR + integration workflows) lands in GP-007.
 * GP-006 ships the renderer + the codegened types + the RuntimeAdapter
 * registry (Python real; Go/Clojure/TypeScript stubs).
 */
export { render } from "./workflows/renderer";
export type { WorkflowPlan, WorkflowJob, WorkflowStep, WorkflowTrigger, } from "./workflows/renderer";
export type { DoraEvent } from "./types/dora-event";
export type { DxConfig } from "./types/dx-config";
export type { RuntimeAdapter, AdapterCommand } from "./adapters/runtime-adapter";
export { NotImplementedError, UnsupportedStackError, AdapterConfigError, } from "./adapters/errors";
export { registry, resolve } from "./adapters/registry";
