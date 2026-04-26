"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiReviewStep = void 0;
/**
 * Amazon Q via GitHub App — comment-trigger. NO `uses: amazon-q-developer/...`
 * action exists; the integration is to POST '/q review' as a PR comment,
 * which the App listens for. Gated on AMAZON_Q_REVIEW_ENABLED so the step
 * no-ops when the consumer hasn't opted in. Caller must declare job-level
 * permissions (pull-requests: write, issues: write, contents: read) — see
 * the ai-review job in pr-pipeline.ts.
 */
function aiReviewStep() {
    return {
        name: "AI review (Amazon Q via GitHub App, non-blocking)",
        if: "${{ vars.AMAZON_Q_REVIEW_ENABLED == 'true' }}",
        run: 'gh pr comment ${{ github.event.pull_request.number }} --body "/q review"',
        env: { GH_TOKEN: "${{ github.token }}" },
    };
}
exports.aiReviewStep = aiReviewStep;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWktcmV2aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWktcmV2aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7Ozs7O0dBT0c7QUFDSCxTQUFnQixZQUFZO0lBQzFCLE9BQU87UUFDTCxJQUFJLEVBQUUsbURBQW1EO1FBQ3pELEVBQUUsRUFBRSwrQ0FBK0M7UUFDbkQsR0FBRyxFQUFFLDBFQUEwRTtRQUMvRSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUU7S0FDekMsQ0FBQztBQUNKLENBQUM7QUFQRCxvQ0FPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgV29ya2Zsb3dTdGVwIH0gZnJvbSBcIi4uL3JlbmRlcmVyXCI7XG5cbi8qKlxuICogQW1hem9uIFEgdmlhIEdpdEh1YiBBcHAg4oCUIGNvbW1lbnQtdHJpZ2dlci4gTk8gYHVzZXM6IGFtYXpvbi1xLWRldmVsb3Blci8uLi5gXG4gKiBhY3Rpb24gZXhpc3RzOyB0aGUgaW50ZWdyYXRpb24gaXMgdG8gUE9TVCAnL3EgcmV2aWV3JyBhcyBhIFBSIGNvbW1lbnQsXG4gKiB3aGljaCB0aGUgQXBwIGxpc3RlbnMgZm9yLiBHYXRlZCBvbiBBTUFaT05fUV9SRVZJRVdfRU5BQkxFRCBzbyB0aGUgc3RlcFxuICogbm8tb3BzIHdoZW4gdGhlIGNvbnN1bWVyIGhhc24ndCBvcHRlZCBpbi4gQ2FsbGVyIG11c3QgZGVjbGFyZSBqb2ItbGV2ZWxcbiAqIHBlcm1pc3Npb25zIChwdWxsLXJlcXVlc3RzOiB3cml0ZSwgaXNzdWVzOiB3cml0ZSwgY29udGVudHM6IHJlYWQpIOKAlCBzZWVcbiAqIHRoZSBhaS1yZXZpZXcgam9iIGluIHByLXBpcGVsaW5lLnRzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWlSZXZpZXdTdGVwKCk6IFdvcmtmbG93U3RlcCB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJBSSByZXZpZXcgKEFtYXpvbiBRIHZpYSBHaXRIdWIgQXBwLCBub24tYmxvY2tpbmcpXCIsXG4gICAgaWY6IFwiJHt7IHZhcnMuQU1BWk9OX1FfUkVWSUVXX0VOQUJMRUQgPT0gJ3RydWUnIH19XCIsXG4gICAgcnVuOiAnZ2ggcHIgY29tbWVudCAke3sgZ2l0aHViLmV2ZW50LnB1bGxfcmVxdWVzdC5udW1iZXIgfX0gLS1ib2R5IFwiL3EgcmV2aWV3XCInLFxuICAgIGVudjogeyBHSF9UT0tFTjogXCIke3sgZ2l0aHViLnRva2VuIH19XCIgfSxcbiAgfTtcbn1cbiJdfQ==