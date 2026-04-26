"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Closes the "attestation without build job" attack. attest-build-provenance
 * fails at runtime with 'subject-path: file not found' if no preceding
 * artifact exists; this test ensures (a) build job exists, (b) it uploads
 * an artifact, (c) attest needs build and references the artifact.
 */
const vitest_1 = require("vitest");
const js_yaml_1 = require("js-yaml");
const renderer_1 = require("../../src/workflows/renderer");
const integration_pipeline_1 = require("../../src/workflows/integration-pipeline");
const python_1 = require("../../src/adapters/python");
const config = { project: "transactionify", stack: "python", service_shape: "lambda" };
const adapter = new python_1.PythonAdapter();
(0, vitest_1.describe)("integration pipeline build → attest wiring", () => {
    const yaml = (0, renderer_1.render)((0, integration_pipeline_1.generateIntegrationPipeline)(adapter, config));
    const parsed = (0, js_yaml_1.load)(yaml);
    (0, vitest_1.it)("build job exists", () => {
        (0, vitest_1.expect)(parsed.jobs.build).toBeDefined();
    });
    (0, vitest_1.it)("build job uploads a 'service-package' artifact", () => {
        const steps = parsed.jobs.build.steps;
        const upload = steps.find((s) => s.uses === "actions/upload-artifact@v4");
        (0, vitest_1.expect)(upload).toBeDefined();
        (0, vitest_1.expect)(upload.with.name).toBe("service-package");
    });
    (0, vitest_1.it)("attest needs build", () => {
        (0, vitest_1.expect)(parsed.jobs.attest.needs).toContain("build");
    });
    (0, vitest_1.it)("attest downloads + references the same artifact", () => {
        const steps = parsed.jobs.attest.steps;
        const dl = steps.find((s) => s.uses === "actions/download-artifact@v4");
        (0, vitest_1.expect)(dl).toBeDefined();
        (0, vitest_1.expect)(dl.with.name).toBe("service-package");
        const at = steps.find((s) => s.uses === "actions/attest-build-provenance@v1");
        (0, vitest_1.expect)(at).toBeDefined();
        (0, vitest_1.expect)(at.with["subject-path"]).toMatch(/artifact/);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9pbnRlZ3JhdGlvbl9idWlsZF9qb2IudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3RfaW50ZWdyYXRpb25fYnVpbGRfam9iLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7R0FLRztBQUNILG1DQUE4QztBQUM5QyxxQ0FBMkM7QUFDM0MsMkRBQXNEO0FBQ3RELG1GQUF1RjtBQUN2RixzREFBMEQ7QUFFMUQsTUFBTSxNQUFNLEdBQUcsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLFFBQWlCLEVBQUUsYUFBYSxFQUFFLFFBQWlCLEVBQUUsQ0FBQztBQUN6RyxNQUFNLE9BQU8sR0FBRyxJQUFJLHNCQUFhLEVBQUUsQ0FBQztBQUVwQyxJQUFBLGlCQUFRLEVBQUMsNENBQTRDLEVBQUUsR0FBRyxFQUFFO0lBQzFELE1BQU0sSUFBSSxHQUFHLElBQUEsaUJBQU0sRUFBQyxJQUFBLGtEQUEyQixFQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLE1BQU0sTUFBTSxHQUFHLElBQUEsY0FBUSxFQUFDLElBQUksQ0FBUSxDQUFDO0lBRXJDLElBQUEsV0FBRSxFQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUMxQixJQUFBLGVBQU0sRUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxXQUFFLEVBQUMsZ0RBQWdELEVBQUUsR0FBRyxFQUFFO1FBQ3hELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQW1CLENBQUM7UUFDcEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzFFLElBQUEsZUFBTSxFQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdCLElBQUEsZUFBTSxFQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLFdBQUUsRUFBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsSUFBQSxlQUFNLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxXQUFFLEVBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO1FBQ3pELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQW1CLENBQUM7UUFDckQsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3hFLElBQUEsZUFBTSxFQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pCLElBQUEsZUFBTSxFQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDN0MsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzlFLElBQUEsZUFBTSxFQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3pCLElBQUEsZUFBTSxFQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ2xvc2VzIHRoZSBcImF0dGVzdGF0aW9uIHdpdGhvdXQgYnVpbGQgam9iXCIgYXR0YWNrLiBhdHRlc3QtYnVpbGQtcHJvdmVuYW5jZVxuICogZmFpbHMgYXQgcnVudGltZSB3aXRoICdzdWJqZWN0LXBhdGg6IGZpbGUgbm90IGZvdW5kJyBpZiBubyBwcmVjZWRpbmdcbiAqIGFydGlmYWN0IGV4aXN0czsgdGhpcyB0ZXN0IGVuc3VyZXMgKGEpIGJ1aWxkIGpvYiBleGlzdHMsIChiKSBpdCB1cGxvYWRzXG4gKiBhbiBhcnRpZmFjdCwgKGMpIGF0dGVzdCBuZWVkcyBidWlsZCBhbmQgcmVmZXJlbmNlcyB0aGUgYXJ0aWZhY3QuXG4gKi9cbmltcG9ydCB7IGRlc2NyaWJlLCBpdCwgZXhwZWN0IH0gZnJvbSBcInZpdGVzdFwiO1xuaW1wb3J0IHsgbG9hZCBhcyB5YW1sTG9hZCB9IGZyb20gXCJqcy15YW1sXCI7XG5pbXBvcnQgeyByZW5kZXIgfSBmcm9tIFwiLi4vLi4vc3JjL3dvcmtmbG93cy9yZW5kZXJlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGVJbnRlZ3JhdGlvblBpcGVsaW5lIH0gZnJvbSBcIi4uLy4uL3NyYy93b3JrZmxvd3MvaW50ZWdyYXRpb24tcGlwZWxpbmVcIjtcbmltcG9ydCB7IFB5dGhvbkFkYXB0ZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2FkYXB0ZXJzL3B5dGhvblwiO1xuXG5jb25zdCBjb25maWcgPSB7IHByb2plY3Q6IFwidHJhbnNhY3Rpb25pZnlcIiwgc3RhY2s6IFwicHl0aG9uXCIgYXMgY29uc3QsIHNlcnZpY2Vfc2hhcGU6IFwibGFtYmRhXCIgYXMgY29uc3QgfTtcbmNvbnN0IGFkYXB0ZXIgPSBuZXcgUHl0aG9uQWRhcHRlcigpO1xuXG5kZXNjcmliZShcImludGVncmF0aW9uIHBpcGVsaW5lIGJ1aWxkIOKGkiBhdHRlc3Qgd2lyaW5nXCIsICgpID0+IHtcbiAgY29uc3QgeWFtbCA9IHJlbmRlcihnZW5lcmF0ZUludGVncmF0aW9uUGlwZWxpbmUoYWRhcHRlciwgY29uZmlnKSk7XG4gIGNvbnN0IHBhcnNlZCA9IHlhbWxMb2FkKHlhbWwpIGFzIGFueTtcblxuICBpdChcImJ1aWxkIGpvYiBleGlzdHNcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChwYXJzZWQuam9icy5idWlsZCkudG9CZURlZmluZWQoKTtcbiAgfSk7XG5cbiAgaXQoXCJidWlsZCBqb2IgdXBsb2FkcyBhICdzZXJ2aWNlLXBhY2thZ2UnIGFydGlmYWN0XCIsICgpID0+IHtcbiAgICBjb25zdCBzdGVwcyA9IHBhcnNlZC5qb2JzLmJ1aWxkLnN0ZXBzIGFzIEFycmF5PGFueT47XG4gICAgY29uc3QgdXBsb2FkID0gc3RlcHMuZmluZCgocykgPT4gcy51c2VzID09PSBcImFjdGlvbnMvdXBsb2FkLWFydGlmYWN0QHY0XCIpO1xuICAgIGV4cGVjdCh1cGxvYWQpLnRvQmVEZWZpbmVkKCk7XG4gICAgZXhwZWN0KHVwbG9hZC53aXRoLm5hbWUpLnRvQmUoXCJzZXJ2aWNlLXBhY2thZ2VcIik7XG4gIH0pO1xuXG4gIGl0KFwiYXR0ZXN0IG5lZWRzIGJ1aWxkXCIsICgpID0+IHtcbiAgICBleHBlY3QocGFyc2VkLmpvYnMuYXR0ZXN0Lm5lZWRzKS50b0NvbnRhaW4oXCJidWlsZFwiKTtcbiAgfSk7XG5cbiAgaXQoXCJhdHRlc3QgZG93bmxvYWRzICsgcmVmZXJlbmNlcyB0aGUgc2FtZSBhcnRpZmFjdFwiLCAoKSA9PiB7XG4gICAgY29uc3Qgc3RlcHMgPSBwYXJzZWQuam9icy5hdHRlc3Quc3RlcHMgYXMgQXJyYXk8YW55PjtcbiAgICBjb25zdCBkbCA9IHN0ZXBzLmZpbmQoKHMpID0+IHMudXNlcyA9PT0gXCJhY3Rpb25zL2Rvd25sb2FkLWFydGlmYWN0QHY0XCIpO1xuICAgIGV4cGVjdChkbCkudG9CZURlZmluZWQoKTtcbiAgICBleHBlY3QoZGwud2l0aC5uYW1lKS50b0JlKFwic2VydmljZS1wYWNrYWdlXCIpO1xuICAgIGNvbnN0IGF0ID0gc3RlcHMuZmluZCgocykgPT4gcy51c2VzID09PSBcImFjdGlvbnMvYXR0ZXN0LWJ1aWxkLXByb3ZlbmFuY2VAdjFcIik7XG4gICAgZXhwZWN0KGF0KS50b0JlRGVmaW5lZCgpO1xuICAgIGV4cGVjdChhdC53aXRoW1wic3ViamVjdC1wYXRoXCJdKS50b01hdGNoKC9hcnRpZmFjdC8pO1xuICB9KTtcbn0pO1xuIl19