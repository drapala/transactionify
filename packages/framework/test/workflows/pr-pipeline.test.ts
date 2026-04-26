import { describe, it, expect } from "vitest";
import { load as yamlLoad } from "js-yaml";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "../../src/workflows/renderer";
import { generatePrPipeline } from "../../src/workflows/pr-pipeline";
import { PythonAdapter } from "../../src/adapters/python";
import type { DxConfig } from "../../src/types/dx-config";

const FIXTURES = resolve(__dirname, "..", "fixtures");
const config: DxConfig = { project: "transactionify", stack: "python", service_shape: "lambda" };
const adapter = new PythonAdapter();

describe("generatePrPipeline", () => {
  it("matches the golden fixture (run pnpm gen-fixtures if you changed the generator)", () => {
    const fresh = render(generatePrPipeline(adapter, config));
    const onDisk = readFileSync(resolve(FIXTURES, "expected-pr-pipeline.yml"), "utf8");
    expect(fresh).toBe(onDisk);
  });

  it("emits 9 jobs in the documented graph", () => {
    const yaml = render(generatePrPipeline(adapter, config));
    const parsed = yamlLoad(yaml) as { jobs: Record<string, any> };
    const ids = Object.keys(parsed.jobs);
    expect(ids).toEqual([
      "lint",
      "work-id-pr-title",
      "unit-tests",
      "pbt",
      "contract",
      "ai-review",
      "cdk-synth",
      "sandbox-verify",
      "dora-emit",
    ]);
  });

  it("encodes execution order via needs:, not key ordering", () => {
    const yaml = render(generatePrPipeline(adapter, config));
    const j = (yamlLoad(yaml) as any).jobs;
    expect(j["unit-tests"].needs).toContain("lint");
    expect(j.pbt.needs).toContain("unit-tests");
    expect(j.contract.needs).toContain("pbt");
    expect(j["ai-review"].needs).toContain("contract");
    expect(j["cdk-synth"].needs).toContain("contract");
    // sandbox-verify gated by BOTH (conjunction)
    expect(j["sandbox-verify"].needs).toEqual(expect.arrayContaining(["cdk-synth", "work-id-pr-title"]));
    expect(j["dora-emit"].needs).toContain("sandbox-verify");
  });

  it("ai-review job is non-blocking and references AMAZON_Q_REVIEW_ENABLED + gh pr comment", () => {
    const yaml = render(generatePrPipeline(adapter, config));
    const j = (yamlLoad(yaml) as any).jobs["ai-review"];
    expect(j["continue-on-error"]).toBe(true);
    expect(j.permissions["pull-requests"]).toBe("write");
    expect(j.permissions.issues).toBe("write");
    expect(j.permissions.contents).toBe("read");
    const stepText = JSON.stringify(j.steps);
    expect(stepText).toMatch(/AMAZON_Q_REVIEW_ENABLED/);
    expect(stepText).toMatch(/gh pr comment/);
    expect(stepText).not.toMatch(/amazon-q-developer\//);
  });

  it("blocking jobs do NOT have continue-on-error", () => {
    const j = (yamlLoad(render(generatePrPipeline(adapter, config))) as any).jobs;
    for (const name of ["lint", "unit-tests", "contract", "sandbox-verify", "cdk-synth", "pbt"]) {
      expect(j[name]["continue-on-error"]).toBeUndefined();
    }
  });

  it("AWS_DEFAULT_REGION=us-east-1 set at job-level on jobs that import production code", () => {
    const j = (yamlLoad(render(generatePrPipeline(adapter, config))) as any).jobs;
    for (const name of ["unit-tests", "pbt", "contract", "cdk-synth", "sandbox-verify"]) {
      expect(j[name].env.AWS_DEFAULT_REGION).toBe("us-east-1");
    }
  });

  it("dora-emit has if: always() so it emits on upstream failure too", () => {
    const j = (yamlLoad(render(generatePrPipeline(adapter, config))) as any).jobs;
    expect(j["dora-emit"].if).toBe("always()");
  });

  it("ai-review needs contract (early Q feedback, NOT after sandbox-verify)", () => {
    const j = (yamlLoad(render(generatePrPipeline(adapter, config))) as any).jobs;
    expect(j["ai-review"].needs).toContain("contract");
    expect(j["ai-review"].needs).not.toContain("sandbox-verify");
  });
});
