"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIntegrationPipeline = void 0;
const build_1 = require("./steps/build");
const attestation_1 = require("./steps/attestation");
const dora_emit_1 = require("./steps/dora-emit");
const RUNS_ON = "ubuntu-latest";
const CHECKOUT = { name: "checkout", uses: "actions/checkout@v4", with: { "fetch-depth": 0 } };
const SETUP_PYTHON = { name: "setup Python", uses: "actions/setup-python@v5", with: { "python-version": "3.11" } };
const SETUP_UV = { name: "install uv", run: "pipx install uv" };
const SETUP_NODE = { name: "setup Node", uses: "actions/setup-node@v4", with: { "node-version": "20", cache: "pnpm" } };
const SETUP_PNPM = { name: "setup pnpm", uses: "pnpm/action-setup@v4", with: { run_install: false } };
function generateIntegrationPipeline(adapter, config) {
    const build = {
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
            ...(0, build_1.buildSteps)(adapter, config),
        ],
    };
    const attest = {
        id: "attest",
        runsOn: RUNS_ON,
        needs: ["build"],
        permissions: { "id-token": "write", attestations: "write", contents: "read" },
        steps: [...(0, attestation_1.attestationSteps)()],
    };
    const deployStaging = {
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
                run: "npx tsc -p tsconfig.cdk.json && npx cdk synth --context account=000000000000 --context region=us-east-1 --quiet && echo 'synth ok — real deploy requires OIDC (ADR Future Integrations)'",
            },
        ],
        environment: "staging",
    };
    const deployProd = {
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
                run: "npx tsc -p tsconfig.cdk.json && npx cdk synth --context account=111111111111 --context region=us-east-1 --quiet && echo 'synth ok — real deploy requires OIDC (ADR Future Integrations)'",
            },
        ],
        environment: "production",
    };
    const doraEmit = {
        id: "dora-emit",
        runsOn: RUNS_ON,
        needs: ["deploy-prod"],
        permissions: { contents: "read" },
        steps: [
            CHECKOUT,
            SETUP_PYTHON,
            (0, dora_emit_1.doraEmitStep)({
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
exports.generateIntegrationPipeline = generateIntegrationPipeline;
