"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attestationSteps = void 0;
const build_1 = require("./build");
/**
 * Attestation job's steps. Subject-path resolves to the artifact the
 * build job uploaded (downloaded into ./artifact/ first). Without a
 * resolvable subject-path, attest-build-provenance fails at runtime
 * with 'subject-path: file not found' — that earlier-draft footgun is
 * exactly what the test_integration_build_job.test.ts exists to prevent.
 */
function attestationSteps() {
    return [
        {
            name: "download service-package artifact",
            uses: "actions/download-artifact@v4",
            with: { name: build_1.SERVICE_PACKAGE_ARTIFACT_NAME, path: "./artifact" },
        },
        {
            name: "attest build provenance",
            uses: "actions/attest-build-provenance@v1",
            with: { "subject-path": "./artifact/*" },
        },
    ];
}
exports.attestationSteps = attestationSteps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0ZXN0YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhdHRlc3RhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBd0Q7QUFFeEQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsZ0JBQWdCO0lBQzlCLE9BQU87UUFDTDtZQUNFLElBQUksRUFBRSxtQ0FBbUM7WUFDekMsSUFBSSxFQUFFLDhCQUE4QjtZQUNwQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUscUNBQTZCLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRTtTQUNsRTtRQUNEO1lBQ0UsSUFBSSxFQUFFLHlCQUF5QjtZQUMvQixJQUFJLEVBQUUsb0NBQW9DO1lBQzFDLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUU7U0FDekM7S0FDRixDQUFDO0FBQ0osQ0FBQztBQWJELDRDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBXb3JrZmxvd1N0ZXAgfSBmcm9tIFwiLi4vcmVuZGVyZXJcIjtcbmltcG9ydCB7IFNFUlZJQ0VfUEFDS0FHRV9BUlRJRkFDVF9OQU1FIH0gZnJvbSBcIi4vYnVpbGRcIjtcblxuLyoqXG4gKiBBdHRlc3RhdGlvbiBqb2IncyBzdGVwcy4gU3ViamVjdC1wYXRoIHJlc29sdmVzIHRvIHRoZSBhcnRpZmFjdCB0aGVcbiAqIGJ1aWxkIGpvYiB1cGxvYWRlZCAoZG93bmxvYWRlZCBpbnRvIC4vYXJ0aWZhY3QvIGZpcnN0KS4gV2l0aG91dCBhXG4gKiByZXNvbHZhYmxlIHN1YmplY3QtcGF0aCwgYXR0ZXN0LWJ1aWxkLXByb3ZlbmFuY2UgZmFpbHMgYXQgcnVudGltZVxuICogd2l0aCAnc3ViamVjdC1wYXRoOiBmaWxlIG5vdCBmb3VuZCcg4oCUIHRoYXQgZWFybGllci1kcmFmdCBmb290Z3VuIGlzXG4gKiBleGFjdGx5IHdoYXQgdGhlIHRlc3RfaW50ZWdyYXRpb25fYnVpbGRfam9iLnRlc3QudHMgZXhpc3RzIHRvIHByZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRlc3RhdGlvblN0ZXBzKCk6IFdvcmtmbG93U3RlcFtdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBuYW1lOiBcImRvd25sb2FkIHNlcnZpY2UtcGFja2FnZSBhcnRpZmFjdFwiLFxuICAgICAgdXNlczogXCJhY3Rpb25zL2Rvd25sb2FkLWFydGlmYWN0QHY0XCIsXG4gICAgICB3aXRoOiB7IG5hbWU6IFNFUlZJQ0VfUEFDS0FHRV9BUlRJRkFDVF9OQU1FLCBwYXRoOiBcIi4vYXJ0aWZhY3RcIiB9LFxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJhdHRlc3QgYnVpbGQgcHJvdmVuYW5jZVwiLFxuICAgICAgdXNlczogXCJhY3Rpb25zL2F0dGVzdC1idWlsZC1wcm92ZW5hbmNlQHYxXCIsXG4gICAgICB3aXRoOiB7IFwic3ViamVjdC1wYXRoXCI6IFwiLi9hcnRpZmFjdC8qXCIgfSxcbiAgICB9LFxuICBdO1xufVxuIl19