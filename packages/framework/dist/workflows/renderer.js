"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
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
const js_yaml_1 = require("js-yaml");
/** Convert a structured plan to a YAML string suitable for `.github/workflows/`. */
function render(plan) {
    if (!plan.name || plan.name.trim() === "") {
        throw new Error("renderer: plan.name is required");
    }
    if (!plan.jobs || plan.jobs.length === 0) {
        throw new Error("renderer: plan.jobs must contain at least one job");
    }
    const jobs = {};
    for (const job of plan.jobs) {
        if (!job.id || job.id.trim() === "") {
            throw new Error("renderer: every job needs an id");
        }
        const jobObj = {
            "runs-on": job.runsOn,
        };
        if (job.needs && job.needs.length > 0)
            jobObj.needs = job.needs;
        if (job.if)
            jobObj.if = job.if;
        if (job.environment)
            jobObj.environment = job.environment;
        if (job.permissions)
            jobObj.permissions = job.permissions;
        if (job.env)
            jobObj.env = job.env;
        if (job.continueOnError)
            jobObj["continue-on-error"] = true;
        jobObj.steps = job.steps.map(stepToYaml);
        jobs[job.id] = jobObj;
    }
    const root = {
        name: plan.name,
        on: plan.on,
    };
    if (plan.permissions)
        root.permissions = plan.permissions;
    if (plan.env)
        root.env = plan.env;
    root.jobs = jobs;
    return (0, js_yaml_1.dump)(root, { noRefs: true, lineWidth: 120, sortKeys: false });
}
exports.render = render;
function stepToYaml(step) {
    const out = { name: step.name };
    if (step.if)
        out.if = step.if;
    if (step.uses)
        out.uses = step.uses;
    if (step.run)
        out.run = step.run;
    if (step.with)
        out.with = step.with;
    if (step.env)
        out.env = step.env;
    if (step.workingDirectory)
        out["working-directory"] = step.workingDirectory;
    return out;
}
