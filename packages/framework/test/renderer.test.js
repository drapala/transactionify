"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const js_yaml_1 = require("js-yaml");
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const renderer_1 = require("../src/workflows/renderer");
const minimalPlan = {
    name: "PR",
    on: { pull_request: { branches: ["main"] } },
    env: { AWS_DEFAULT_REGION: "us-east-1" },
    jobs: [
        {
            id: "lint",
            runsOn: "ubuntu-latest",
            steps: [
                { name: "checkout", uses: "actions/checkout@v4" },
                { name: "ruff", run: "ruff check ." },
            ],
        },
        {
            id: "unit",
            runsOn: "ubuntu-latest",
            needs: ["lint"],
            steps: [{ name: "pytest", run: "uv run pytest" }],
        },
    ],
};
(0, vitest_1.describe)("renderer.render", () => {
    (0, vitest_1.it)("emits YAML parseable by js-yaml", () => {
        const yaml = (0, renderer_1.render)(minimalPlan);
        const parsed = (0, js_yaml_1.load)(yaml);
        (0, vitest_1.expect)(parsed.name).toBe("PR");
        (0, vitest_1.expect)(parsed.jobs).toBeDefined();
    });
    (0, vitest_1.it)("preserves step ordering", () => {
        const yaml = (0, renderer_1.render)(minimalPlan);
        const checkoutIdx = yaml.indexOf("checkout");
        const ruffIdx = yaml.indexOf("ruff");
        (0, vitest_1.expect)(checkoutIdx).toBeGreaterThan(0);
        (0, vitest_1.expect)(ruffIdx).toBeGreaterThan(checkoutIdx);
    });
    (0, vitest_1.it)("preserves job dependency declarations", () => {
        const yaml = (0, renderer_1.render)(minimalPlan);
        const parsed = (0, js_yaml_1.load)(yaml);
        (0, vitest_1.expect)(parsed.jobs.unit.needs).toEqual(["lint"]);
    });
    (0, vitest_1.it)("rejects empty plan name", () => {
        (0, vitest_1.expect)(() => (0, renderer_1.render)({ ...minimalPlan, name: "" })).toThrow(/name/);
    });
    (0, vitest_1.it)("rejects plan without jobs", () => {
        (0, vitest_1.expect)(() => (0, renderer_1.render)({ ...minimalPlan, jobs: [] })).toThrow(/jobs/);
    });
    (0, vitest_1.it)("output passes actionlint when actionlint is on PATH", () => {
        let actionlintAvailable = true;
        try {
            (0, node_child_process_1.execFileSync)("actionlint", ["-version"], { stdio: "ignore" });
        }
        catch {
            actionlintAvailable = false;
        }
        if (!actionlintAvailable) {
            // actionlint absent locally → skip (CI installs it via tests/workspace/test_workspace_health.sh).
            return;
        }
        const yaml = (0, renderer_1.render)(minimalPlan);
        const dir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "gp-renderer-"));
        const wfDir = (0, node_path_1.join)(dir, ".github", "workflows");
        (0, node_child_process_1.execFileSync)("mkdir", ["-p", wfDir]);
        const wfPath = (0, node_path_1.join)(wfDir, "pr.yml");
        (0, node_fs_1.writeFileSync)(wfPath, yaml);
        // actionlint exits 0 on clean files.
        (0, node_child_process_1.execFileSync)("actionlint", [wfPath], { stdio: "inherit" });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlbmRlcmVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBOEM7QUFDOUMscUNBQTJDO0FBQzNDLDJEQUFrRDtBQUNsRCxxQ0FBcUQ7QUFDckQscUNBQWlDO0FBQ2pDLHlDQUFpQztBQUNqQyx3REFBc0U7QUFFdEUsTUFBTSxXQUFXLEdBQWlCO0lBQ2hDLElBQUksRUFBRSxJQUFJO0lBQ1YsRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtJQUM1QyxHQUFHLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUU7SUFDeEMsSUFBSSxFQUFFO1FBQ0o7WUFDRSxFQUFFLEVBQUUsTUFBTTtZQUNWLE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLEtBQUssRUFBRTtnQkFDTCxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFO2dCQUNqRCxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRTthQUN0QztTQUNGO1FBQ0Q7WUFDRSxFQUFFLEVBQUUsTUFBTTtZQUNWLE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLENBQUM7U0FDbEQ7S0FDRjtDQUNGLENBQUM7QUFFRixJQUFBLGlCQUFRLEVBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBQy9CLElBQUEsV0FBRSxFQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtRQUN6QyxNQUFNLElBQUksR0FBRyxJQUFBLGlCQUFNLEVBQUMsV0FBVyxDQUFDLENBQUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsSUFBQSxjQUFRLEVBQUMsSUFBSSxDQUE0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RUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyQyxJQUFBLHVCQUFhLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVCLHFDQUFxQztRQUNyQyxJQUFBLGlDQUFZLEVBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVzY3JpYmUsIGl0LCBleHBlY3QgfSBmcm9tIFwidml0ZXN0XCI7XG5pbXBvcnQgeyBsb2FkIGFzIHlhbWxMb2FkIH0gZnJvbSBcImpzLXlhbWxcIjtcbmltcG9ydCB7IGV4ZWNGaWxlU3luYyB9IGZyb20gXCJub2RlOmNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IG1rZHRlbXBTeW5jLCB3cml0ZUZpbGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IHRtcGRpciB9IGZyb20gXCJub2RlOm9zXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcIm5vZGU6cGF0aFwiO1xuaW1wb3J0IHsgcmVuZGVyLCB0eXBlIFdvcmtmbG93UGxhbiB9IGZyb20gXCIuLi9zcmMvd29ya2Zsb3dzL3JlbmRlcmVyXCI7XG5cbmNvbnN0IG1pbmltYWxQbGFuOiBXb3JrZmxvd1BsYW4gPSB7XG4gIG5hbWU6IFwiUFJcIixcbiAgb246IHsgcHVsbF9yZXF1ZXN0OiB7IGJyYW5jaGVzOiBbXCJtYWluXCJdIH0gfSxcbiAgZW52OiB7IEFXU19ERUZBVUxUX1JFR0lPTjogXCJ1cy1lYXN0LTFcIiB9LFxuICBqb2JzOiBbXG4gICAge1xuICAgICAgaWQ6IFwibGludFwiLFxuICAgICAgcnVuc09uOiBcInVidW50dS1sYXRlc3RcIixcbiAgICAgIHN0ZXBzOiBbXG4gICAgICAgIHsgbmFtZTogXCJjaGVja291dFwiLCB1c2VzOiBcImFjdGlvbnMvY2hlY2tvdXRAdjRcIiB9LFxuICAgICAgICB7IG5hbWU6IFwicnVmZlwiLCBydW46IFwicnVmZiBjaGVjayAuXCIgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogXCJ1bml0XCIsXG4gICAgICBydW5zT246IFwidWJ1bnR1LWxhdGVzdFwiLFxuICAgICAgbmVlZHM6IFtcImxpbnRcIl0sXG4gICAgICBzdGVwczogW3sgbmFtZTogXCJweXRlc3RcIiwgcnVuOiBcInV2IHJ1biBweXRlc3RcIiB9XSxcbiAgICB9LFxuICBdLFxufTtcblxuZGVzY3JpYmUoXCJyZW5kZXJlci5yZW5kZXJcIiwgKCkgPT4ge1xuICBpdChcImVtaXRzIFlBTUwgcGFyc2VhYmxlIGJ5IGpzLXlhbWxcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHlhbWwgPSByZW5kZXIobWluaW1hbFBsYW4pO1xuICAgIGNvbnN0IHBhcnNlZCA9IHlhbWxMb2FkKHlhbWwpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAgIGV4cGVjdChwYXJzZWQubmFtZSkudG9CZShcIlBSXCIpO1xuICAgIGV4cGVjdChwYXJzZWQuam9icykudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbiAgaXQoXCJwcmVzZXJ2ZXMgc3RlcCBvcmRlcmluZ1wiLCAoKSA9PiB7XG4gICAgY29uc3QgeWFtbCA9IHJlbmRlcihtaW5pbWFsUGxhbik7XG4gICAgY29uc3QgY2hlY2tvdXRJZHggPSB5YW1sLmluZGV4T2YoXCJjaGVja291dFwiKTtcbiAgICBjb25zdCBydWZmSWR4ID0geWFtbC5pbmRleE9mKFwicnVmZlwiKTtcbiAgICBleHBlY3QoY2hlY2tvdXRJZHgpLnRvQmVHcmVhdGVyVGhhbigwKTtcbiAgICBleHBlY3QocnVmZklkeCkudG9CZUdyZWF0ZXJUaGFuKGNoZWNrb3V0SWR4KTtcbiAgfSk7XG5cbiAgaXQoXCJwcmVzZXJ2ZXMgam9iIGRlcGVuZGVuY3kgZGVjbGFyYXRpb25zXCIsICgpID0+IHtcbiAgICBjb25zdCB5YW1sID0gcmVuZGVyKG1pbmltYWxQbGFuKTtcbiAgICBjb25zdCBwYXJzZWQgPSB5YW1sTG9hZCh5YW1sKSBhcyB7IGpvYnM6IFJlY29yZDxzdHJpbmcsIHsgbmVlZHM/OiBzdHJpbmdbXSB9PiB9O1xuICAgIGV4cGVjdChwYXJzZWQuam9icy51bml0Lm5lZWRzKS50b0VxdWFsKFtcImxpbnRcIl0pO1xuICB9KTtcblxuICBpdChcInJlamVjdHMgZW1wdHkgcGxhbiBuYW1lXCIsICgpID0+IHtcbiAgICBleHBlY3QoKCkgPT4gcmVuZGVyKHsgLi4ubWluaW1hbFBsYW4sIG5hbWU6IFwiXCIgfSkpLnRvVGhyb3coL25hbWUvKTtcbiAgfSk7XG5cbiAgaXQoXCJyZWplY3RzIHBsYW4gd2l0aG91dCBqb2JzXCIsICgpID0+IHtcbiAgICBleHBlY3QoKCkgPT4gcmVuZGVyKHsgLi4ubWluaW1hbFBsYW4sIGpvYnM6IFtdIH0pKS50b1Rocm93KC9qb2JzLyk7XG4gIH0pO1xuXG4gIGl0KFwib3V0cHV0IHBhc3NlcyBhY3Rpb25saW50IHdoZW4gYWN0aW9ubGludCBpcyBvbiBQQVRIXCIsICgpID0+IHtcbiAgICBsZXQgYWN0aW9ubGludEF2YWlsYWJsZSA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWNGaWxlU3luYyhcImFjdGlvbmxpbnRcIiwgW1wiLXZlcnNpb25cIl0sIHsgc3RkaW86IFwiaWdub3JlXCIgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBhY3Rpb25saW50QXZhaWxhYmxlID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICghYWN0aW9ubGludEF2YWlsYWJsZSkge1xuICAgICAgLy8gYWN0aW9ubGludCBhYnNlbnQgbG9jYWxseSDihpIgc2tpcCAoQ0kgaW5zdGFsbHMgaXQgdmlhIHRlc3RzL3dvcmtzcGFjZS90ZXN0X3dvcmtzcGFjZV9oZWFsdGguc2gpLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB5YW1sID0gcmVuZGVyKG1pbmltYWxQbGFuKTtcbiAgICBjb25zdCBkaXIgPSBta2R0ZW1wU3luYyhqb2luKHRtcGRpcigpLCBcImdwLXJlbmRlcmVyLVwiKSk7XG4gICAgY29uc3Qgd2ZEaXIgPSBqb2luKGRpciwgXCIuZ2l0aHViXCIsIFwid29ya2Zsb3dzXCIpO1xuICAgIGV4ZWNGaWxlU3luYyhcIm1rZGlyXCIsIFtcIi1wXCIsIHdmRGlyXSk7XG4gICAgY29uc3Qgd2ZQYXRoID0gam9pbih3ZkRpciwgXCJwci55bWxcIik7XG4gICAgd3JpdGVGaWxlU3luYyh3ZlBhdGgsIHlhbWwpO1xuICAgIC8vIGFjdGlvbmxpbnQgZXhpdHMgMCBvbiBjbGVhbiBmaWxlcy5cbiAgICBleGVjRmlsZVN5bmMoXCJhY3Rpb25saW50XCIsIFt3ZlBhdGhdLCB7IHN0ZGlvOiBcImluaGVyaXRcIiB9KTtcbiAgfSk7XG59KTtcbiJdfQ==