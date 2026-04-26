/**
 * GitHub Rulesets API request body shape.
 * Source: https://docs.github.com/rest/repos/rules
 *
 * Note: the API uses `target` as a top-level string (branch|tag|push) and
 * `conditions.ref_name.{include, exclude}` for branch selection. Earlier-draft
 * `target: { include: ['main'] }` is a non-existent shape that returns 422.
 */
export type RulesetTarget = "branch" | "tag" | "push";
export type RulesetEnforcement = "active" | "evaluate" | "disabled";

export interface RefNameConditions {
  include: string[];
  exclude: string[];
}

export interface RulesetConditions {
  ref_name: RefNameConditions;
}

export interface PullRequestRule {
  type: "pull_request";
  parameters: {
    required_approving_review_count: number;
    dismiss_stale_reviews_on_push?: boolean;
    require_code_owner_review?: boolean;
    require_last_push_approval?: boolean;
    required_review_thread_resolution?: boolean;
  };
}

export interface RequiredStatusChecksRule {
  type: "required_status_checks";
  parameters: {
    required_status_checks: Array<{ context: string }>;
    strict_required_status_checks_policy?: boolean;
  };
}

export interface DeletionRule {
  type: "deletion";
}

export interface NonFastForwardRule {
  type: "non_fast_forward";
}

/**
 * NOT in the default ruleset (P0-7). Documented as opt-in / evolution-path
 * via .dx.yaml.governance.signed_commits=true.
 */
export interface RequiredSignaturesRule {
  type: "required_signatures";
}

export type RulesetRule =
  | PullRequestRule
  | RequiredStatusChecksRule
  | DeletionRule
  | NonFastForwardRule
  | RequiredSignaturesRule;

export interface RulesetBody {
  name: string;
  target: RulesetTarget;
  enforcement: RulesetEnforcement;
  conditions: RulesetConditions;
  rules: RulesetRule[];
}
