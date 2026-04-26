/**
 * Base GitHub Actions workflow renderer.
 *
 * Accepts a structured `WorkflowPlan` and emits a YAML string that downstream
 * tooling (actionlint, GitHub Actions runtime) accepts. The renderer itself is
 * dumb on purpose — concrete pipeline shape (PR + integration) lands in GP-007.
 *
 * Step ordering is preserved (js-yaml v4 emits maps in insertion order with
 * `noRefs`, and we emit arrays for ordered steps).
 */
import { dump } from "js-yaml";

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
export function render(plan: WorkflowPlan): string {
  if (!plan.name || plan.name.trim() === "") {
    throw new Error("renderer: plan.name is required");
  }
  if (!plan.jobs || plan.jobs.length === 0) {
    throw new Error("renderer: plan.jobs must contain at least one job");
  }

  const jobs: Record<string, unknown> = {};
  for (const job of plan.jobs) {
    if (!job.id || job.id.trim() === "") {
      throw new Error("renderer: every job needs an id");
    }
    const jobObj: Record<string, unknown> = {
      "runs-on": job.runsOn,
    };
    if (job.needs && job.needs.length > 0) jobObj.needs = job.needs;
    if (job.if) jobObj.if = job.if;
    if (job.environment) jobObj.environment = job.environment;
    if (job.permissions) jobObj.permissions = job.permissions;
    if (job.env) jobObj.env = job.env;
    if (job.continueOnError) jobObj["continue-on-error"] = true;
    jobObj.steps = job.steps.map(stepToYaml);
    jobs[job.id] = jobObj;
  }

  const root: Record<string, unknown> = {
    name: plan.name,
    on: plan.on,
  };
  if (plan.permissions) root.permissions = plan.permissions;
  if (plan.env) root.env = plan.env;
  root.jobs = jobs;

  return dump(root, { noRefs: true, lineWidth: 120, sortKeys: false });
}

function stepToYaml(step: WorkflowStep): Record<string, unknown> {
  const out: Record<string, unknown> = { name: step.name };
  if (step.if) out.if = step.if;
  if (step.uses) out.uses = step.uses;
  if (step.run) out.run = step.run;
  if (step.with) out.with = step.with;
  if (step.env) out.env = step.env;
  if (step.workingDirectory) out["working-directory"] = step.workingDirectory;
  return out;
}
