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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yay1pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndvcmstaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMkNBQXVDO0FBRXZDOzs7R0FHRztBQUNILFNBQWdCLGlCQUFpQjtJQUMvQixNQUFNLE9BQU8sR0FBRyxvQkFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUM7SUFDakQsT0FBTztRQUNMLElBQUksRUFBRSx3QkFBd0I7UUFDOUIsR0FBRyxFQUFFO1lBQ0gscUJBQXFCO1lBQ3JCLFlBQVksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDN0MseUNBQXlDO1lBQ3pDLG9JQUFvSTtZQUNwSSxVQUFVO1lBQ1YsSUFBSTtTQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNaLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSx3Q0FBd0MsRUFBRTtLQUM1RCxDQUFDO0FBQ0osQ0FBQztBQWRELDhDQWNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBXb3JrZmxvd1N0ZXAgfSBmcm9tIFwiLi4vcmVuZGVyZXJcIjtcbmltcG9ydCB7IG1hbmlmZXN0IH0gZnJvbSBcIi4vX21hbmlmZXN0XCI7XG5cbi8qKlxuICogVGhlIFBSLXRpdGxlIHdvcmtfaWQgY2hlY2suIFJlYWRzIGBzdWJqZWN0X3BhdHRlcm5gIGZyb20gdGhlIEdFTkVSQVRFRFxuICogbWFuaWZlc3QgKHNpbmdsZSBzb3VyY2Ugb2YgdHJ1dGgg4oCUIHNhbWUgcmVnZXggZHggY2hlY2sgd29ya19pZCB1c2VzKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtJZFByVGl0bGVTdGVwKCk6IFdvcmtmbG93U3RlcCB7XG4gIGNvbnN0IHBhdHRlcm4gPSBtYW5pZmVzdC53b3JrX2lkLnN1YmplY3RfcGF0dGVybjtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcIndvcmstaWQgUFIgdGl0bGUgY2hlY2tcIixcbiAgICBydW46IFtcbiAgICAgIFwidGl0bGU9XFxcIiRQUl9USVRMRVxcXCJcIixcbiAgICAgIGBwYXR0ZXJuPScke3BhdHRlcm4ucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIil9J2AsXG4gICAgICBcImlmIFtbICEgXFxcIiR0aXRsZVxcXCIgPX4gJHBhdHRlcm4gXV07IHRoZW5cIixcbiAgICAgIFwiICBlY2hvIFxcXCI6OmVycm9yOjpQUiB0aXRsZSAnJHRpdGxlJyBtdXN0IG1hdGNoICRwYXR0ZXJuIChlLmcuICdHUC0xMjM6IGZlYXQgYWRkIHZhbGlkYXRvcicpLiBTZWUgLmtpcm8vc3RlZXJpbmcvZ29sZGVuLXBhdGgubWQuXFxcIiBcIixcbiAgICAgIFwiICBleGl0IDFcIixcbiAgICAgIFwiZmlcIixcbiAgICBdLmpvaW4oXCJcXG5cIiksXG4gICAgZW52OiB7IFBSX1RJVExFOiBcIiR7eyBnaXRodWIuZXZlbnQucHVsbF9yZXF1ZXN0LnRpdGxlIH19XCIgfSxcbiAgfTtcbn1cbiJdfQ==