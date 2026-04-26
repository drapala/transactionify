/**
 * Integration pipeline (push to main + workflow_dispatch).
 *
 * Job graph:
 *   build -> attest -> deploy-staging -> deploy-prod -> dora-emit (always)
 *
 * PoC fidelity caveat: deploy-staging and deploy-prod are SYNTH-ONLY against
 * stub account ids (same pattern as PR sandbox-verify). Real cloud deploys
 * require OIDC + per-environment AWS roles — documented in the ADR Future
 * Integrations as evolution path. The structural shape (build -> attest ->
 * staging -> prod) is the production-true shape; only the deploy mechanics
 * differ at PoC fidelity.
 */
import type { RuntimeAdapter } from "../adapters/runtime-adapter";
import type { DxConfig } from "../types/dx-config";
import type { WorkflowPlan } from "./renderer";
export declare function generateIntegrationPipeline(adapter: RuntimeAdapter, config: DxConfig): WorkflowPlan;
