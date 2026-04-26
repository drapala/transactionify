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

export function buildDefaultRuleset(opts: BuildDefaultRulesetOptions): RulesetBody {
  const branches = opts.branches ?? ["refs/heads/main"];
  const reviewers = opts.requiredApprovers ?? 2;

  if (!opts.requiredChecks || opts.requiredChecks.length === 0) {
    throw new Error(
      "buildDefaultRuleset: requiredChecks must contain at least one context. " +
        "Pass extractBlockingJobsFromWorkflow(...) — hardcoding the list is a documented anti-pattern.",
    );
  }

  const rules: RulesetBody["rules"] = [
    {
      type: "pull_request",
      parameters: {
        required_approving_review_count: reviewers,
        dismiss_stale_reviews_on_push: true,
        require_code_owner_review: true,
        require_last_push_approval: false,
        required_review_thread_resolution: true,
      },
    },
    {
      type: "required_status_checks",
      parameters: {
        required_status_checks: opts.requiredChecks.map((c) => ({ context: c })),
        strict_required_status_checks_policy: true,
      },
    },
    { type: "deletion" },
    { type: "non_fast_forward" },
  ];

  if (opts.signedCommits) {
    // Opt-in. The default omits this so the demo PR's unsigned commits can merge.
    rules.push({ type: "required_signatures" });
  }

  return {
    name: opts.name ?? "golden-path-default",
    target: "branch",
    enforcement: "active",
    conditions: { ref_name: { include: branches, exclude: [] } },
    rules,
  };
}
