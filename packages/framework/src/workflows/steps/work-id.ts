import type { WorkflowStep } from "../renderer";
import manifest from "../../generated/check-manifest.json";

/**
 * The PR-title work_id check. Reads `subject_pattern` from the GENERATED
 * manifest (single source of truth — same regex dx check work_id uses).
 */
export function workIdPrTitleStep(): WorkflowStep {
  const pattern = (manifest as any).work_id.subject_pattern as string;
  return {
    name: "work-id PR title check",
    run: [
      "title=\"$PR_TITLE\"",
      `pattern='${pattern.replace(/'/g, "'\\''")}'`,
      "if [[ ! \"$title\" =~ $pattern ]]; then",
      "  echo \"::error::PR title '$title' must match $pattern (e.g. 'GP-123: feat add validator'). See .kiro/steering/golden-path.md.\" ",
      "  exit 1",
      "fi",
    ].join("\n"),
    env: { PR_TITLE: "${{ github.event.pull_request.title }}" },
  };
}
