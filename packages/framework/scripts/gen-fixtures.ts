/**
 * Regenerate the golden fixtures for PR + integration pipelines.
 *
 * Run: `pnpm --filter @golden-path/framework run gen-fixtures`
 * CI: `git diff --exit-code packages/framework/test/fixtures/` after running
 *     this script — drift fails the build (validation_commands #2).
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "../src/workflows/renderer";
import { generatePrPipeline } from "../src/workflows/pr-pipeline";
import { generateIntegrationPipeline } from "../src/workflows/integration-pipeline";
import { PythonAdapter } from "../src/adapters/python";
import type { DxConfig } from "../src/types/dx-config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT = resolve(__dirname, "..", "test", "fixtures");

const config: DxConfig = {
  project: "transactionify",
  stack: "python",
  service_shape: "lambda",
};
const adapter = new PythonAdapter();

writeFileSync(resolve(OUT, "expected-pr-pipeline.yml"), render(generatePrPipeline(adapter, config)));
writeFileSync(resolve(OUT, "expected-integration-pipeline.yml"), render(generateIntegrationPipeline(adapter, config)));

// eslint-disable-next-line no-console
console.log("gen-fixtures: wrote test/fixtures/expected-pr-pipeline.yml + expected-integration-pipeline.yml");
