import type { WorkflowStep } from "../renderer";
/**
 * Amazon Q via GitHub App — comment-trigger. NO `uses: amazon-q-developer/...`
 * action exists; the integration is to POST '/q review' as a PR comment,
 * which the App listens for. Gated on AMAZON_Q_REVIEW_ENABLED so the step
 * no-ops when the consumer hasn't opted in. Caller must declare job-level
 * permissions (pull-requests: write, issues: write, contents: read) — see
 * the ai-review job in pr-pipeline.ts.
 */
export declare function aiReviewStep(): WorkflowStep;
