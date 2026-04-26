"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBlockingJobsFromWorkflow = exports.extractBlockingJobsFromWorkflowText = exports.buildDefaultRuleset = void 0;
/**
 * extractBlockingJobsFromWorkflow — parse a generated GH Actions YAML and
 * return the list of jobs that must pass before merge (status check contexts).
 *
 * Excludes:
 *   - jobs with `continue-on-error: true` (e.g. ai-review)
 *   - jobs with `if: always()` (e.g. dora-emit)
 * Everything else is "blocking" by virtue of being in the needs: graph
 * without an opt-out.
 */
const node_fs_1 = require("node:fs");
const js_yaml_1 = require("js-yaml");
var defaults_1 = require("./defaults");
Object.defineProperty(exports, "buildDefaultRuleset", { enumerable: true, get: function () { return defaults_1.buildDefaultRuleset; } });
function extractBlockingJobsFromWorkflowText(yamlText) {
    const parsed = (0, js_yaml_1.load)(yamlText);
    if (!parsed || !parsed.jobs)
        return [];
    const out = [];
    for (const [name, job] of Object.entries(parsed.jobs)) {
        if (!job || typeof job !== "object")
            continue;
        const j = job;
        if (j["continue-on-error"] === true)
            continue;
        if (typeof j["if"] === "string" && j["if"].trim() === "always()")
            continue;
        out.push(name);
    }
    return out;
}
exports.extractBlockingJobsFromWorkflowText = extractBlockingJobsFromWorkflowText;
function extractBlockingJobsFromWorkflow(path) {
    return extractBlockingJobsFromWorkflowText((0, node_fs_1.readFileSync)(path, "utf8"));
}
exports.extractBlockingJobsFromWorkflow = extractBlockingJobsFromWorkflow;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXNldHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJydWxlc2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7Ozs7O0dBU0c7QUFDSCxxQ0FBdUM7QUFDdkMscUNBQTJDO0FBQzNDLHVDQUFpRDtBQUF4QywrR0FBQSxtQkFBbUIsT0FBQTtBQUc1QixTQUFnQixtQ0FBbUMsQ0FBQyxRQUFnQjtJQUNsRSxNQUFNLE1BQU0sR0FBRyxJQUFBLGNBQVEsRUFBQyxRQUFRLENBQTBDLENBQUM7SUFDM0UsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDdkMsTUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO0lBQ3pCLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUFFLFNBQVM7UUFDOUMsTUFBTSxDQUFDLEdBQUcsR0FBOEIsQ0FBQztRQUN6QyxJQUFJLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLElBQUk7WUFBRSxTQUFTO1FBQzlDLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxVQUFVO1lBQUUsU0FBUztRQUMzRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pCLENBQUM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFaRCxrRkFZQztBQUVELFNBQWdCLCtCQUErQixDQUFDLElBQVk7SUFDMUQsT0FBTyxtQ0FBbUMsQ0FBQyxJQUFBLHNCQUFZLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDekUsQ0FBQztBQUZELDBFQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBleHRyYWN0QmxvY2tpbmdKb2JzRnJvbVdvcmtmbG93IOKAlCBwYXJzZSBhIGdlbmVyYXRlZCBHSCBBY3Rpb25zIFlBTUwgYW5kXG4gKiByZXR1cm4gdGhlIGxpc3Qgb2Ygam9icyB0aGF0IG11c3QgcGFzcyBiZWZvcmUgbWVyZ2UgKHN0YXR1cyBjaGVjayBjb250ZXh0cykuXG4gKlxuICogRXhjbHVkZXM6XG4gKiAgIC0gam9icyB3aXRoIGBjb250aW51ZS1vbi1lcnJvcjogdHJ1ZWAgKGUuZy4gYWktcmV2aWV3KVxuICogICAtIGpvYnMgd2l0aCBgaWY6IGFsd2F5cygpYCAoZS5nLiBkb3JhLWVtaXQpXG4gKiBFdmVyeXRoaW5nIGVsc2UgaXMgXCJibG9ja2luZ1wiIGJ5IHZpcnR1ZSBvZiBiZWluZyBpbiB0aGUgbmVlZHM6IGdyYXBoXG4gKiB3aXRob3V0IGFuIG9wdC1vdXQuXG4gKi9cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gXCJub2RlOmZzXCI7XG5pbXBvcnQgeyBsb2FkIGFzIHlhbWxMb2FkIH0gZnJvbSBcImpzLXlhbWxcIjtcbmV4cG9ydCB7IGJ1aWxkRGVmYXVsdFJ1bGVzZXQgfSBmcm9tIFwiLi9kZWZhdWx0c1wiO1xuZXhwb3J0IHR5cGUgeyBSdWxlc2V0Qm9keSwgUnVsZXNldFJ1bGUsIFJ1bGVzZXRUYXJnZXQgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEJsb2NraW5nSm9ic0Zyb21Xb3JrZmxvd1RleHQoeWFtbFRleHQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgY29uc3QgcGFyc2VkID0geWFtbExvYWQoeWFtbFRleHQpIGFzIHsgam9icz86IFJlY29yZDxzdHJpbmcsIGFueT4gfSB8IG51bGw7XG4gIGlmICghcGFyc2VkIHx8ICFwYXJzZWQuam9icykgcmV0dXJuIFtdO1xuICBjb25zdCBvdXQ6IHN0cmluZ1tdID0gW107XG4gIGZvciAoY29uc3QgW25hbWUsIGpvYl0gb2YgT2JqZWN0LmVudHJpZXMocGFyc2VkLmpvYnMpKSB7XG4gICAgaWYgKCFqb2IgfHwgdHlwZW9mIGpvYiAhPT0gXCJvYmplY3RcIikgY29udGludWU7XG4gICAgY29uc3QgaiA9IGpvYiBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICBpZiAoaltcImNvbnRpbnVlLW9uLWVycm9yXCJdID09PSB0cnVlKSBjb250aW51ZTtcbiAgICBpZiAodHlwZW9mIGpbXCJpZlwiXSA9PT0gXCJzdHJpbmdcIiAmJiBqW1wiaWZcIl0udHJpbSgpID09PSBcImFsd2F5cygpXCIpIGNvbnRpbnVlO1xuICAgIG91dC5wdXNoKG5hbWUpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0QmxvY2tpbmdKb2JzRnJvbVdvcmtmbG93KHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGV4dHJhY3RCbG9ja2luZ0pvYnNGcm9tV29ya2Zsb3dUZXh0KHJlYWRGaWxlU3luYyhwYXRoLCBcInV0ZjhcIikpO1xufVxuIl19