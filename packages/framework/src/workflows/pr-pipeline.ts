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
import type { WorkflowJob, WorkflowPlan } from "./renderer";
import { lintStep } from "./steps/lint";
import { unitTestsStep } from "./steps/unit-tests";
import { pbtStep } from "./steps/pbt";
import { contractStep } from "./steps/contract";
import { workIdPrTitleStep } from "./steps/work-id";
import { aiReviewStep } from "./steps/ai-review";
import { cdkSynthStep, sandboxVerifyStep } from "./steps/cdk-synth";
import { doraEmitStep } from "./steps/dora-emit";

const RUNS_ON = "ubuntu-latest";

const SETUP_PYTHON = {
  name: "setup Python",
  uses: "actions/setup-python@v5",
  with: { "python-version": "3.11" } as Record<string, string | number | boolean>,
};

const SETUP_UV = { name: "install uv", run: "pipx install uv" };

const SETUP_NODE = {
  name: "setup Node",
  uses: "actions/setup-node@v4",
  with: { "node-version": "20", cache: "pnpm" } as Record<string, string | number | boolean>,
};

const SETUP_PNPM = {
  name: "setup pnpm",
  uses: "pnpm/action-setup@v4",
  with: { run_install: false } as Record<string, string | number | boolean>,
};

const CHECKOUT = { name: "checkout", uses: "actions/checkout@v4", with: { "fetch-depth": 0 } };

const AWS_REGION_ENV = { AWS_DEFAULT_REGION: "us-east-1" };

function pythonJob(id: string, needs: string[], stepFn: () => any): WorkflowJob {
  return {
    id,
    runsOn: RUNS_ON,
    needs,
    env: AWS_REGION_ENV,
    steps: [CHECKOUT, SETUP_PYTHON, SETUP_UV, { name: "uv sync", run: "uv sync --all-packages" }, stepFn()],
  };
}

export function generatePrPipeline(adapter: RuntimeAdapter, config: DxConfig): WorkflowPlan {
  const testRoot = config.test_root ?? (config.service_shape === "lambda" ? "test/unit/src/python" : "tests");

  const lint: WorkflowJob = {
    id: "lint",
    runsOn: RUNS_ON,
    steps: [CHECKOUT, SETUP_PYTHON, SETUP_UV, { name: "uv sync", run: "uv sync --all-packages" }, lintStep()],
  };

  const workIdPrTitle: WorkflowJob = {
    id: "work-id-pr-title",
    runsOn: RUNS_ON,
    needs: ["lint"],
    steps: [workIdPrTitleStep()],
  };

  const unitTests: WorkflowJob = pythonJob("unit-tests", ["lint"], () => unitTestsStep(testRoot));
  const pbt: WorkflowJob = pythonJob("pbt", ["unit-tests"], () => pbtStep(testRoot));
  const contract: WorkflowJob = pythonJob("contract", ["pbt"], () => contractStep());

  const aiReview: WorkflowJob = {
    id: "ai-review",
    runsOn: RUNS_ON,
    needs: ["contract"],
    permissions: { contents: "read", "pull-requests": "write", issues: "write" },
    // continue-on-error is attached after construction; the renderer passes
    // it through. ai-review never blocks deploy — Q is a finger-post, not a gate.
    steps: [CHECKOUT, aiReviewStep()],
    continueOnError: true,
  };

  const cdkSynth: WorkflowJob = {
    id: "cdk-synth",
    runsOn: RUNS_ON,
    needs: ["contract"],
    env: AWS_REGION_ENV,
    steps: [
      CHECKOUT,
      SETUP_NODE,
      SETUP_PNPM,
      { name: "install deps", run: "pnpm install --frozen-lockfile" },
      cdkSynthStep(),
    ],
  };

  const sandboxVerify: WorkflowJob = {
    id: "sandbox-verify",
    runsOn: RUNS_ON,
    needs: ["cdk-synth", "work-id-pr-title"],
    env: AWS_REGION_ENV,
    steps: [
      CHECKOUT,
      SETUP_NODE,
      SETUP_PNPM,
      { name: "install deps", run: "pnpm install --frozen-lockfile" },
      sandboxVerifyStep(),
    ],
  };

  const doraEmit: WorkflowJob = {
    id: "dora-emit",
    runsOn: RUNS_ON,
    needs: ["sandbox-verify"],
    // Run even if upstream failed — outcome reflects success/failure.
    permissions: { contents: "read" },
    steps: [
      CHECKOUT,
      SETUP_PYTHON,
      doraEmitStep({
        eventType: "pipeline_run",
        service: config.project,
        outcomeFromJob: "${{ needs.sandbox-verify.result == 'success' && 'success' || 'failure' }}",
      }),
      {
        name: "upload dora-events",
        uses: "actions/upload-artifact@v4",
        with: { name: "dora-events", path: "dora-events/" },
      },
    ],
    // Run even if upstream failed — outcome reflects success/failure.
    if: "always()",
  };

  const plan: WorkflowPlan = {
    name: "PR",
    on: {
      pull_request: { branches: ["main"] },
      workflow_dispatch: {},
    },
    permissions: { contents: "read" },
    jobs: [lint, workIdPrTitle, unitTests, pbt, contract, aiReview, cdkSynth, sandboxVerify, doraEmit],
  };

  return plan;
}
