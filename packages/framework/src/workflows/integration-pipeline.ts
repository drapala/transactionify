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
import type { WorkflowJob, WorkflowPlan } from "./renderer";
import { buildSteps } from "./steps/build";
import { attestationSteps } from "./steps/attestation";
import { doraEmitStep } from "./steps/dora-emit";

const RUNS_ON = "ubuntu-latest";

const CHECKOUT = { name: "checkout", uses: "actions/checkout@v4", with: { "fetch-depth": 0 } };
const SETUP_PYTHON = { name: "setup Python", uses: "actions/setup-python@v5", with: { "python-version": "3.11" } as Record<string, string | number | boolean> };
const SETUP_UV = { name: "install uv", run: "pipx install uv" };
const SETUP_NODE = { name: "setup Node", uses: "actions/setup-node@v4", with: { "node-version": "20", cache: "pnpm" } as Record<string, string | number | boolean> };
const SETUP_PNPM = { name: "setup pnpm", uses: "pnpm/action-setup@v4", with: { run_install: false } as Record<string, string | number | boolean> };

export function generateIntegrationPipeline(adapter: RuntimeAdapter, config: DxConfig): WorkflowPlan {
  const build: WorkflowJob = {
    id: "build",
    runsOn: RUNS_ON,
    env: { AWS_DEFAULT_REGION: "us-east-1" },
    steps: [
      CHECKOUT,
      SETUP_PNPM,
      SETUP_NODE,
      SETUP_PYTHON,
      SETUP_UV,
      { name: "install deps (pnpm)", run: "pnpm install --frozen-lockfile" },
      { name: "install deps (uv)", run: "uv sync --all-packages" },
      ...buildSteps(adapter, config),
    ],
  };

  const attest: WorkflowJob = {
    id: "attest",
    runsOn: RUNS_ON,
    needs: ["build"],
    permissions: { "id-token": "write", attestations: "write", contents: "read" },
    steps: [...attestationSteps()],
  };

  const deployStaging: WorkflowJob = {
    id: "deploy-staging",
    runsOn: RUNS_ON,
    needs: ["attest"],
    env: { AWS_DEFAULT_REGION: "us-east-1" },
    steps: [
      CHECKOUT,
      SETUP_PNPM,
      SETUP_NODE,
      { name: "install deps", run: "pnpm install --frozen-lockfile" },
      {
        name: "deploy-staging (synth-only at PoC fidelity)",
        run: "npx cdk synth --context account=000000000000 --context region=us-east-1 --quiet && echo 'synth ok — real deploy requires OIDC (ADR Future Integrations)'",
      },
    ],
    environment: "staging",
  };

  const deployProd: WorkflowJob = {
    id: "deploy-prod",
    runsOn: RUNS_ON,
    needs: ["deploy-staging"],
    env: { AWS_DEFAULT_REGION: "us-east-1" },
    steps: [
      CHECKOUT,
      SETUP_PNPM,
      SETUP_NODE,
      { name: "install deps", run: "pnpm install --frozen-lockfile" },
      {
        name: "deploy-prod (synth-only at PoC fidelity)",
        run: "npx cdk synth --context account=111111111111 --context region=us-east-1 --quiet && echo 'synth ok — real deploy requires OIDC (ADR Future Integrations)'",
      },
    ],
    environment: "production",
  };

  const doraEmit: WorkflowJob = {
    id: "dora-emit",
    runsOn: RUNS_ON,
    needs: ["deploy-prod"],
    permissions: { contents: "read" },
    steps: [
      CHECKOUT,
      SETUP_PYTHON,
      doraEmitStep({
        eventType: "deployment",
        service: config.project,
        outcomeFromJob: "${{ needs.deploy-prod.result == 'success' && 'success' || 'failure' }}",
      }),
      {
        name: "upload dora-events",
        uses: "actions/upload-artifact@v4",
        with: { name: "dora-events", path: "dora-events/" },
      },
    ],
    if: "always()",
  };

  return {
    name: "integration",
    on: {
      push: { branches: ["main"] },
      workflow_dispatch: {},
    },
    permissions: { contents: "read" },
    jobs: [build, attest, deployStaging, deployProd, doraEmit],
  };
}
