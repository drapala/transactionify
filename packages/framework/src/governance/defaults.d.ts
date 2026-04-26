/**
 * Default ruleset builder. Required-status-checks list is DERIVED from the
 * caller's input (typically extractBlockingJobsFromWorkflow output), NOT
 * hardcoded — keeps protection in sync with the actual workflow shape.
 */
import type { RulesetBody } from "./types";
export interface BuildDefaultRulesetOptions {
    /** Names of jobs that must pass before merge (status check contexts). */
    requiredChecks: string[];
    /** Optional override for the ruleset name. */
    name?: string;
    /** Branch refs the ruleset applies to. Defaults to ["refs/heads/main"]. */
    branches?: string[];
    /** Required approving review count. Defaults to 2. */
    requiredApprovers?: number;
    /** Opt-in signed-commits enforcement (off by default — see P0-7 in the ticket). */
    signedCommits?: boolean;
}
export declare function buildDefaultRuleset(opts: BuildDefaultRulesetOptions): RulesetBody;
