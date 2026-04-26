/**
 * PR pipeline generator. Composes the documented job graph:
 *
 *   lint → { work-id-pr-title || unit-tests } → pbt → contract
 *        → { ai-review (continue-on-error) || cdk-synth (parallel) }
 *        → sandbox-verify (needs both cdk-synth AND work-id-pr-title)
 *        → dora-emit (always)
 *
 * Required env on jobs that import the production code (which loads boto3
 * at module-import time): AWS_DEFAULT_REGION=us-east-1 (P0-1 audit fix).
 */
import type { RuntimeAdapter } from "../adapters/runtime-adapter";
import type { DxConfig } from "../types/dx-config";
import type { WorkflowPlan } from "./renderer";
export declare function generatePrPipeline(adapter: RuntimeAdapter, config: DxConfig): WorkflowPlan;
