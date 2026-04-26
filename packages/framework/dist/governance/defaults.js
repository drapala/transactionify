"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDefaultRuleset = void 0;
function buildDefaultRuleset(opts) {
    const branches = opts.branches ?? ["refs/heads/main"];
    const reviewers = opts.requiredApprovers ?? 2;
    if (!opts.requiredChecks || opts.requiredChecks.length === 0) {
        throw new Error("buildDefaultRuleset: requiredChecks must contain at least one context. " +
            "Pass extractBlockingJobsFromWorkflow(...) — hardcoding the list is a documented anti-pattern.");
    }
    const rules = [
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
exports.buildDefaultRuleset = buildDefaultRuleset;
