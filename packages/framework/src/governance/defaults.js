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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWZhdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFvQkEsU0FBZ0IsbUJBQW1CLENBQUMsSUFBZ0M7SUFDbEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQztJQUU5QyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM3RCxNQUFNLElBQUksS0FBSyxDQUNiLHlFQUF5RTtZQUN2RSwrRkFBK0YsQ0FDbEcsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBeUI7UUFDbEM7WUFDRSxJQUFJLEVBQUUsY0FBYztZQUNwQixVQUFVLEVBQUU7Z0JBQ1YsK0JBQStCLEVBQUUsU0FBUztnQkFDMUMsNkJBQTZCLEVBQUUsSUFBSTtnQkFDbkMseUJBQXlCLEVBQUUsSUFBSTtnQkFDL0IsMEJBQTBCLEVBQUUsS0FBSztnQkFDakMsaUNBQWlDLEVBQUUsSUFBSTthQUN4QztTQUNGO1FBQ0Q7WUFDRSxJQUFJLEVBQUUsd0JBQXdCO1lBQzlCLFVBQVUsRUFBRTtnQkFDVixzQkFBc0IsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RSxvQ0FBb0MsRUFBRSxJQUFJO2FBQzNDO1NBQ0Y7UUFDRCxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7UUFDcEIsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7S0FDN0IsQ0FBQztJQUVGLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZCLDhFQUE4RTtRQUM5RSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLHFCQUFxQjtRQUN4QyxNQUFNLEVBQUUsUUFBUTtRQUNoQixXQUFXLEVBQUUsUUFBUTtRQUNyQixVQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUM1RCxLQUFLO0tBQ04sQ0FBQztBQUNKLENBQUM7QUE3Q0Qsa0RBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEZWZhdWx0IHJ1bGVzZXQgYnVpbGRlci4gUmVxdWlyZWQtc3RhdHVzLWNoZWNrcyBsaXN0IGlzIERFUklWRUQgZnJvbSB0aGVcbiAqIGNhbGxlcidzIGlucHV0ICh0eXBpY2FsbHkgZXh0cmFjdEJsb2NraW5nSm9ic0Zyb21Xb3JrZmxvdyBvdXRwdXQpLCBOT1RcbiAqIGhhcmRjb2RlZCDigJQga2VlcHMgcHJvdGVjdGlvbiBpbiBzeW5jIHdpdGggdGhlIGFjdHVhbCB3b3JrZmxvdyBzaGFwZS5cbiAqL1xuaW1wb3J0IHR5cGUgeyBSdWxlc2V0Qm9keSB9IGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnVpbGREZWZhdWx0UnVsZXNldE9wdGlvbnMge1xuICAvKiogTmFtZXMgb2Ygam9icyB0aGF0IG11c3QgcGFzcyBiZWZvcmUgbWVyZ2UgKHN0YXR1cyBjaGVjayBjb250ZXh0cykuICovXG4gIHJlcXVpcmVkQ2hlY2tzOiBzdHJpbmdbXTtcbiAgLyoqIE9wdGlvbmFsIG92ZXJyaWRlIGZvciB0aGUgcnVsZXNldCBuYW1lLiAqL1xuICBuYW1lPzogc3RyaW5nO1xuICAvKiogQnJhbmNoIHJlZnMgdGhlIHJ1bGVzZXQgYXBwbGllcyB0by4gRGVmYXVsdHMgdG8gW1wicmVmcy9oZWFkcy9tYWluXCJdLiAqL1xuICBicmFuY2hlcz86IHN0cmluZ1tdO1xuICAvKiogUmVxdWlyZWQgYXBwcm92aW5nIHJldmlldyBjb3VudC4gRGVmYXVsdHMgdG8gMi4gKi9cbiAgcmVxdWlyZWRBcHByb3ZlcnM/OiBudW1iZXI7XG4gIC8qKiBPcHQtaW4gc2lnbmVkLWNvbW1pdHMgZW5mb3JjZW1lbnQgKG9mZiBieSBkZWZhdWx0IOKAlCBzZWUgUDAtNyBpbiB0aGUgdGlja2V0KS4gKi9cbiAgc2lnbmVkQ29tbWl0cz86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERlZmF1bHRSdWxlc2V0KG9wdHM6IEJ1aWxkRGVmYXVsdFJ1bGVzZXRPcHRpb25zKTogUnVsZXNldEJvZHkge1xuICBjb25zdCBicmFuY2hlcyA9IG9wdHMuYnJhbmNoZXMgPz8gW1wicmVmcy9oZWFkcy9tYWluXCJdO1xuICBjb25zdCByZXZpZXdlcnMgPSBvcHRzLnJlcXVpcmVkQXBwcm92ZXJzID8/IDI7XG5cbiAgaWYgKCFvcHRzLnJlcXVpcmVkQ2hlY2tzIHx8IG9wdHMucmVxdWlyZWRDaGVja3MubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJidWlsZERlZmF1bHRSdWxlc2V0OiByZXF1aXJlZENoZWNrcyBtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGNvbnRleHQuIFwiICtcbiAgICAgICAgXCJQYXNzIGV4dHJhY3RCbG9ja2luZ0pvYnNGcm9tV29ya2Zsb3coLi4uKSDigJQgaGFyZGNvZGluZyB0aGUgbGlzdCBpcyBhIGRvY3VtZW50ZWQgYW50aS1wYXR0ZXJuLlwiLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBydWxlczogUnVsZXNldEJvZHlbXCJydWxlc1wiXSA9IFtcbiAgICB7XG4gICAgICB0eXBlOiBcInB1bGxfcmVxdWVzdFwiLFxuICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICByZXF1aXJlZF9hcHByb3ZpbmdfcmV2aWV3X2NvdW50OiByZXZpZXdlcnMsXG4gICAgICAgIGRpc21pc3Nfc3RhbGVfcmV2aWV3c19vbl9wdXNoOiB0cnVlLFxuICAgICAgICByZXF1aXJlX2NvZGVfb3duZXJfcmV2aWV3OiB0cnVlLFxuICAgICAgICByZXF1aXJlX2xhc3RfcHVzaF9hcHByb3ZhbDogZmFsc2UsXG4gICAgICAgIHJlcXVpcmVkX3Jldmlld190aHJlYWRfcmVzb2x1dGlvbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcInJlcXVpcmVkX3N0YXR1c19jaGVja3NcIixcbiAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgcmVxdWlyZWRfc3RhdHVzX2NoZWNrczogb3B0cy5yZXF1aXJlZENoZWNrcy5tYXAoKGMpID0+ICh7IGNvbnRleHQ6IGMgfSkpLFxuICAgICAgICBzdHJpY3RfcmVxdWlyZWRfc3RhdHVzX2NoZWNrc19wb2xpY3k6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgeyB0eXBlOiBcImRlbGV0aW9uXCIgfSxcbiAgICB7IHR5cGU6IFwibm9uX2Zhc3RfZm9yd2FyZFwiIH0sXG4gIF07XG5cbiAgaWYgKG9wdHMuc2lnbmVkQ29tbWl0cykge1xuICAgIC8vIE9wdC1pbi4gVGhlIGRlZmF1bHQgb21pdHMgdGhpcyBzbyB0aGUgZGVtbyBQUidzIHVuc2lnbmVkIGNvbW1pdHMgY2FuIG1lcmdlLlxuICAgIHJ1bGVzLnB1c2goeyB0eXBlOiBcInJlcXVpcmVkX3NpZ25hdHVyZXNcIiB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogb3B0cy5uYW1lID8/IFwiZ29sZGVuLXBhdGgtZGVmYXVsdFwiLFxuICAgIHRhcmdldDogXCJicmFuY2hcIixcbiAgICBlbmZvcmNlbWVudDogXCJhY3RpdmVcIixcbiAgICBjb25kaXRpb25zOiB7IHJlZl9uYW1lOiB7IGluY2x1ZGU6IGJyYW5jaGVzLCBleGNsdWRlOiBbXSB9IH0sXG4gICAgcnVsZXMsXG4gIH07XG59XG4iXX0=