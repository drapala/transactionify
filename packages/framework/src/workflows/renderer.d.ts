export interface WorkflowStep {
    name: string;
    /** Either a `run` shell command OR a `uses` action reference. */
    run?: string;
    uses?: string;
    with?: Record<string, string | number | boolean>;
    env?: Record<string, string>;
    if?: string;
    /** Working directory relative to the repo root. */
    workingDirectory?: string;
}
export interface WorkflowJob {
    id: string;
    runsOn: string;
    needs?: string[];
    env?: Record<string, string>;
    permissions?: Record<string, string>;
    steps: WorkflowStep[];
    /** When true, the job's failure does NOT fail the workflow (used for ai-review). */
    continueOnError?: boolean;
    /** Job-level `if:` expression (e.g. 'always()' for dora-emit). */
    if?: string;
    /** GitHub deployment environment (used by deploy-staging / deploy-prod). */
    environment?: string;
}
export interface WorkflowTrigger {
    /** e.g. { pull_request: { branches: ['main'] }, workflow_dispatch: {} } */
    [event: string]: Record<string, unknown> | null;
}
export interface WorkflowPlan {
    name: string;
    on: WorkflowTrigger;
    env?: Record<string, string>;
    permissions?: Record<string, string>;
    jobs: WorkflowJob[];
}
/** Convert a structured plan to a YAML string suitable for `.github/workflows/`. */
export declare function render(plan: WorkflowPlan): string;
