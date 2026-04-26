"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrPipeline = void 0;
const lint_1 = require("./steps/lint");
const unit_tests_1 = require("./steps/unit-tests");
const pbt_1 = require("./steps/pbt");
const contract_1 = require("./steps/contract");
const work_id_1 = require("./steps/work-id");
const ai_review_1 = require("./steps/ai-review");
const cdk_synth_1 = require("./steps/cdk-synth");
const dora_emit_1 = require("./steps/dora-emit");
const RUNS_ON = "ubuntu-latest";
const SETUP_PYTHON = {
    name: "setup Python",
    uses: "actions/setup-python@v5",
    with: { "python-version": "3.11" },
};
const SETUP_UV = { name: "install uv", run: "pipx install uv" };
// `uv sync` installs into .venv/bin, which is NOT on PATH by default in CI.
// Installing dev tooling to the system Python (managed by actions/setup-python)
// puts ruff/pytest/etc on PATH for the subsequent step's bare invocation.
// CHECK_MANIFEST stays at `ruff check .` (no `uv run` prefix); local devs get
// the same binaries via `uv sync` + their venv activation, or via
// `uv tool install ruff` for a global isolated copy.
const INSTALL_PY_TOOLING = {
    name: "install python dev tooling to system",
    run: "uv pip install --system ruff pytest pytest-mock pytest-cov hypothesis jsonschema pyyaml typer rich jinja2 openapi-spec-validator",
};
// Install fork-side test deps too (boto3 stubs, moto, etc) so unit-tests
// can collect against test/unit/src/python/requirements.txt without needing
// the candidate to maintain a synced super-list.
const INSTALL_FORK_TEST_DEPS = {
    name: "install fork test requirements",
    run: "if [ -f test/unit/src/python/requirements.txt ]; then uv pip install --system -r test/unit/src/python/requirements.txt; fi",
};
const SETUP_NODE = {
    name: "setup Node",
    uses: "actions/setup-node@v4",
    with: { "node-version": "20", cache: "pnpm" },
};
const SETUP_PNPM = {
    name: "setup pnpm",
    uses: "pnpm/action-setup@v4",
    with: { run_install: false },
};
const CHECKOUT = { name: "checkout", uses: "actions/checkout@v4", with: { "fetch-depth": 0 } };
const AWS_REGION_ENV = { AWS_DEFAULT_REGION: "us-east-1" };
function pythonJob(id, needs, stepFn) {
    return {
        id,
        runsOn: RUNS_ON,
        needs,
        env: AWS_REGION_ENV,
        steps: [CHECKOUT, SETUP_PYTHON, SETUP_UV, INSTALL_PY_TOOLING, INSTALL_FORK_TEST_DEPS, stepFn()],
    };
}
function generatePrPipeline(adapter, config) {
    const testRoot = config.test_root ?? (config.service_shape === "lambda" ? "test/unit/src/python" : "tests");
    const lint = {
        id: "lint",
        runsOn: RUNS_ON,
        steps: [CHECKOUT, SETUP_PYTHON, SETUP_UV, INSTALL_PY_TOOLING, (0, lint_1.lintStep)()],
    };
    const workIdPrTitle = {
        id: "work-id-pr-title",
        runsOn: RUNS_ON,
        needs: ["lint"],
        steps: [(0, work_id_1.workIdPrTitleStep)()],
    };
    const unitTests = pythonJob("unit-tests", ["lint"], () => (0, unit_tests_1.unitTestsStep)(testRoot));
    const pbt = pythonJob("pbt", ["unit-tests"], () => (0, pbt_1.pbtStep)(testRoot));
    const contract = pythonJob("contract", ["pbt"], () => (0, contract_1.contractStep)());
    const aiReview = {
        id: "ai-review",
        runsOn: RUNS_ON,
        needs: ["contract"],
        permissions: { contents: "read", "pull-requests": "write", issues: "write" },
        // continue-on-error is attached after construction; the renderer passes
        // it through. ai-review never blocks deploy — Q is a finger-post, not a gate.
        steps: [CHECKOUT, (0, ai_review_1.aiReviewStep)()],
        continueOnError: true,
    };
    const cdkSynth = {
        id: "cdk-synth",
        runsOn: RUNS_ON,
        needs: ["contract"],
        env: AWS_REGION_ENV,
        steps: [
            CHECKOUT,
            SETUP_NODE,
            SETUP_PNPM,
            { name: "install deps", run: "pnpm install --frozen-lockfile" },
            (0, cdk_synth_1.cdkSynthStep)(),
        ],
    };
    const sandboxVerify = {
        id: "sandbox-verify",
        runsOn: RUNS_ON,
        needs: ["cdk-synth", "work-id-pr-title"],
        env: AWS_REGION_ENV,
        steps: [
            CHECKOUT,
            SETUP_NODE,
            SETUP_PNPM,
            { name: "install deps", run: "pnpm install --frozen-lockfile" },
            (0, cdk_synth_1.sandboxVerifyStep)(),
        ],
    };
    const doraEmit = {
        id: "dora-emit",
        runsOn: RUNS_ON,
        needs: ["sandbox-verify"],
        // Run even if upstream failed — outcome reflects success/failure.
        permissions: { contents: "read" },
        steps: [
            CHECKOUT,
            SETUP_PYTHON,
            (0, dora_emit_1.doraEmitStep)({
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
    const plan = {
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
exports.generatePrPipeline = generatePrPipeline;
