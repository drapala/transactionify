/**
 * PythonAdapter — the real adapter dogfooded against the Transactionify fork.
 *
 * lint:     ruff check .
 * unit:     pytest -x -q -m 'not pbt'   (cwd from .dx.yaml.test_root)
 * pbt:      pytest -x -q -m pbt          (cwd from .dx.yaml.test_root)
 * contract: schemathesis run openapi.yaml --hypothesis-deadline=2000
 * package:  service_shape-aware
 *             - lambda → cdk synth + tar cdk.out
 *             - wheel  → uv build
 *             - unset & ambiguous → AdapterConfigError
 *
 * test_root defaults by service_shape:
 *   - lambda → 'test/unit/src/python' (Transactionify-style)
 *   - wheel  → 'tests'                (distributable Python)
 * Override via .dx.yaml.test_root when the project deviates.
 */
import type { DxConfig } from "../types/dx-config";
import type { AdapterCommand, RuntimeAdapter } from "./runtime-adapter";
import { AdapterConfigError } from "./errors";

const DEFAULT_TEST_ROOT_BY_SHAPE: Record<string, string> = {
  lambda: "test/unit/src/python",
  wheel: "tests",
};

function resolveTestRoot(config: DxConfig): string {
  if (config.test_root && config.test_root.trim() !== "") return config.test_root;
  const fallback = DEFAULT_TEST_ROOT_BY_SHAPE[config.service_shape];
  if (!fallback) {
    // The schema enum (lambda | wheel | binary) prevents this for non-binary;
    // binary is reserved for Go/Clojure and shouldn't reach PythonAdapter.
    throw new AdapterConfigError(
      `python adapter cannot infer test_root from service_shape='${config.service_shape}'; declare test_root in .dx.yaml`,
    );
  }
  return fallback;
}

export class PythonAdapter implements RuntimeAdapter {
  readonly stack = "python" as const;

  lintCommand(_config: DxConfig): AdapterCommand {
    return { cmd: "ruff", args: ["check", "."] };
  }

  unitTestCommand(config: DxConfig): AdapterCommand {
    return {
      cmd: "pytest",
      args: ["-x", "-q", "-m", "not pbt"],
      cwd: resolveTestRoot(config),
    };
  }

  pbtCommand(config: DxConfig): AdapterCommand {
    return {
      cmd: "pytest",
      args: ["-x", "-q", "-m", "pbt"],
      cwd: resolveTestRoot(config),
    };
  }

  contractCommand(_config: DxConfig): AdapterCommand {
    // Schemathesis is the platform default for OpenAPI-driven contract checks.
    // Per-project tweaks are expressed via custom_steps in .dx.yaml, not by
    // overriding this method.
    return {
      cmd: "schemathesis",
      args: ["run", "openapi.yaml", "--hypothesis-deadline=2000", "--checks=all"],
    };
  }

  packageCommand(config: DxConfig): AdapterCommand {
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
            "npx tsc -p tsconfig.cdk.json && npx cdk synth --quiet && tar -czf service-package.tgz cdk.out/",
          ],
        };
      case "wheel":
        return { cmd: "uv", args: ["build"] };
      case "binary":
        throw new AdapterConfigError(
          "python adapter does not support service_shape='binary' (binary is reserved for Go/Clojure adapters)",
        );
      default:
        throw new AdapterConfigError(
          "cannot determine package shape; declare service_shape in .dx.yaml (lambda | wheel)",
        );
    }
  }
}
