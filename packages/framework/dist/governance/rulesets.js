"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBlockingJobsFromWorkflow = exports.extractBlockingJobsFromWorkflowText = exports.buildDefaultRuleset = void 0;
/**
 * extractBlockingJobsFromWorkflow — parse a generated GH Actions YAML and
 * return the list of jobs that must pass before merge (status check contexts).
 *
 * Excludes:
 *   - jobs with `continue-on-error: true` (e.g. ai-review)
 *   - jobs with `if: always()` (e.g. dora-emit)
 * Everything else is "blocking" by virtue of being in the needs: graph
 * without an opt-out.
 */
const node_fs_1 = require("node:fs");
const js_yaml_1 = require("js-yaml");
var defaults_1 = require("./defaults");
Object.defineProperty(exports, "buildDefaultRuleset", { enumerable: true, get: function () { return defaults_1.buildDefaultRuleset; } });
function extractBlockingJobsFromWorkflowText(yamlText) {
    const parsed = (0, js_yaml_1.load)(yamlText);
    if (!parsed || !parsed.jobs)
        return [];
    const out = [];
    for (const [name, job] of Object.entries(parsed.jobs)) {
        if (!job || typeof job !== "object")
            continue;
        const j = job;
        if (j["continue-on-error"] === true)
            continue;
        if (typeof j["if"] === "string" && j["if"].trim() === "always()")
            continue;
        out.push(name);
    }
    return out;
}
exports.extractBlockingJobsFromWorkflowText = extractBlockingJobsFromWorkflowText;
function extractBlockingJobsFromWorkflow(path) {
    return extractBlockingJobsFromWorkflowText((0, node_fs_1.readFileSync)(path, "utf8"));
}
exports.extractBlockingJobsFromWorkflow = extractBlockingJobsFromWorkflow;
