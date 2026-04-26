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
import { readFileSync } from "node:fs";
import { load as yamlLoad } from "js-yaml";
export { buildDefaultRuleset } from "./defaults";
export type { RulesetBody, RulesetRule, RulesetTarget } from "./types";

export function extractBlockingJobsFromWorkflowText(yamlText: string): string[] {
  const parsed = yamlLoad(yamlText) as { jobs?: Record<string, any> } | null;
  if (!parsed || !parsed.jobs) return [];
  const out: string[] = [];
  for (const [name, job] of Object.entries(parsed.jobs)) {
    if (!job || typeof job !== "object") continue;
    const j = job as Record<string, unknown>;
    if (j["continue-on-error"] === true) continue;
    if (typeof j["if"] === "string" && j["if"].trim() === "always()") continue;
    out.push(name);
  }
  return out;
}

export function extractBlockingJobsFromWorkflow(path: string): string[] {
  return extractBlockingJobsFromWorkflowText(readFileSync(path, "utf8"));
}
