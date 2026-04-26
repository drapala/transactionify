export { buildDefaultRuleset } from "./defaults";
export type { RulesetBody, RulesetRule, RulesetTarget } from "./types";
export declare function extractBlockingJobsFromWorkflowText(yamlText: string): string[];
export declare function extractBlockingJobsFromWorkflow(path: string): string[];
