"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonAdapter = void 0;
const errors_1 = require("./errors");
const DEFAULT_TEST_ROOT_BY_SHAPE = {
    lambda: "test/unit/src/python",
    wheel: "tests",
};
function resolveTestRoot(config) {
    if (config.test_root && config.test_root.trim() !== "")
        return config.test_root;
    const fallback = DEFAULT_TEST_ROOT_BY_SHAPE[config.service_shape];
    if (!fallback) {
        // The schema enum (lambda | wheel | binary) prevents this for non-binary;
        // binary is reserved for Go/Clojure and shouldn't reach PythonAdapter.
        throw new errors_1.AdapterConfigError(`python adapter cannot infer test_root from service_shape='${config.service_shape}'; declare test_root in .dx.yaml`);
    }
    return fallback;
}
class PythonAdapter {
    stack = "python";
    lintCommand(_config) {
        return { cmd: "ruff", args: ["check", "."] };
    }
    unitTestCommand(config) {
        return {
            cmd: "pytest",
            args: ["-x", "-q", "-m", "not pbt"],
            cwd: resolveTestRoot(config),
        };
    }
    pbtCommand(config) {
        return {
            cmd: "pytest",
            args: ["-x", "-q", "-m", "pbt"],
            cwd: resolveTestRoot(config),
        };
    }
    contractCommand(_config) {
        // Schemathesis is the platform default for OpenAPI-driven contract checks.
        // Per-project tweaks are expressed via custom_steps in .dx.yaml, not by
        // overriding this method.
        return {
            cmd: "schemathesis",
            args: ["run", "openapi.yaml", "--hypothesis-deadline=2000", "--checks=all"],
        };
    }
    packageCommand(config) {
        switch (config.service_shape) {
            case "lambda":
                // Bundle the CDK synth output. Honest about what it covers: this is
                // a packaging convenience for upload-artifact + attest-build-provenance
                // (single subject). Per-asset attestation (one subject per
                // cdk.out/asset.<hash>.zip) is the documented evolution path; CDK
                // deploys per-asset, not the tarball. Do NOT claim the tarball "is
                // what gets deployed".
                return {
                    cmd: "sh",
                    args: [
                        "-c",
                        "npx tsc && npx cdk synth --quiet && tar -czf service-package.tgz cdk.out/",
                    ],
                };
            case "wheel":
                return { cmd: "uv", args: ["build"] };
            case "binary":
                throw new errors_1.AdapterConfigError("python adapter does not support service_shape='binary' (binary is reserved for Go/Clojure adapters)");
            default:
                throw new errors_1.AdapterConfigError("cannot determine package shape; declare service_shape in .dx.yaml (lambda | wheel)");
        }
    }
}
exports.PythonAdapter = PythonAdapter;
