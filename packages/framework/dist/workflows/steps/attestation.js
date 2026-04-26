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
