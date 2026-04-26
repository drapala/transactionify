"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workIdPrTitleStep = void 0;
const _manifest_1 = require("./_manifest");
/**
 * The PR-title work_id check. Reads `subject_pattern` from the GENERATED
 * manifest (single source of truth — same regex dx check work_id uses).
 */
function workIdPrTitleStep() {
    const pattern = _manifest_1.manifest.work_id.subject_pattern;
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
exports.workIdPrTitleStep = workIdPrTitleStep;
