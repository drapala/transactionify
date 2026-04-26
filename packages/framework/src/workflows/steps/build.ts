import type { WorkflowStep } from "../renderer";
import type { RuntimeAdapter } from "../../adapters/runtime-adapter";
import type { DxConfig } from "../../types/dx-config";

/**
 * Build job's command + artifact upload. The artifact name is fixed
 * ('service-package') so the attest job can reference it without a
 * cross-job needs-output dance.
 */
export function buildSteps(adapter: RuntimeAdapter, config: DxConfig): WorkflowStep[] {
  const pkg = adapter.packageCommand(config);
  const cmd = pkg.cwd
    ? `( cd ${pkg.cwd} && ${pkg.cmd} ${pkg.args.join(" ")} )`
    : `${pkg.cmd} ${pkg.args.join(" ")}`;
  return [
    { name: "package (RuntimeAdapter.packageCommand)", run: cmd },
    {
      name: "upload service-package artifact",
      uses: "actions/upload-artifact@v4",
      with: {
        name: "service-package",
        path: config.service_shape === "lambda" ? "service-package.tgz" : "dist/*",
        "if-no-files-found": "error",
      },
    },
  ];
}

export const SERVICE_PACKAGE_ARTIFACT_NAME = "service-package";
