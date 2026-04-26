import type { WorkflowStep } from "../renderer";
import type { RuntimeAdapter } from "../../adapters/runtime-adapter";
import type { DxConfig } from "../../types/dx-config";
/**
 * Build job's command + artifact upload. The artifact name is fixed
 * ('service-package') so the attest job can reference it without a
 * cross-job needs-output dance.
 */
export declare function buildSteps(adapter: RuntimeAdapter, config: DxConfig): WorkflowStep[];
export declare const SERVICE_PACKAGE_ARTIFACT_NAME = "service-package";
