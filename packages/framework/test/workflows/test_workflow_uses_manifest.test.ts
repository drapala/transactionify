/**
 * Cross-import enforcement (Design Principle 2). The framework's workflow
 * generator MUST read check commands from check-manifest.json, not from
 * hardcoded duplicates. We assert this by parsing the generated YAML and
 * matching each step's run command against `cmd + args` from the manifest.
 */
import { describe, it, expect } from "vitest";
import { load as yamlLoad } from "js-yaml";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import manifest from "../../src/generated/check-manifest.json";
import { render } from "../../src/workflows/renderer";
import { generatePrPipeline } from "../../src/workflows/pr-pipeline";
import { PythonAdapter } from "../../src/adapters/python";

const config = { project: "transactionify", stack: "python" as const, service_shape: "lambda" as const };
const adapter = new PythonAdapter();

function findStepRun(parsed: any, jobId: string, stepNamePattern: RegExp): string {
  const steps = parsed.jobs[jobId].steps as Array<{ name: string; run?: string }>;
  const step = steps.find((s) => stepNamePattern.test(s.name) && s.run);
  if (!step || !step.run) throw new Error(`step ${stepNamePattern} not found in job ${jobId}`);
  return step.run;
}

describe("workflow steps consume CHECK_MANIFEST byte-for-byte (no hardcoded copies)", () => {
  const yaml = render(generatePrPipeline(adapter, config));
  const parsed = yamlLoad(yaml) as any;

  it("lint step uses CHECK_MANIFEST.lint.{cmd,args}", () => {
    const expected = [(manifest as any).lint.cmd, ...(manifest as any).lint.args].join(" ");
    expect(findStepRun(parsed, "lint", /^lint$/)).toBe(expected);
  });

  it("unit-tests step uses CHECK_MANIFEST.unit_tests.{cmd,args}", () => {
    const expected = [(manifest as any).unit_tests.cmd, ...(manifest as any).unit_tests.args].join(" ");
    expect(findStepRun(parsed, "unit-tests", /unit tests/)).toBe(expected);
  });

  it("pbt step uses CHECK_MANIFEST.pbt.{cmd,args}", () => {
    const expected = [(manifest as any).pbt.cmd, ...(manifest as any).pbt.args].join(" ");
    expect(findStepRun(parsed, "pbt", /PBT/)).toBe(expected);
  });

  it("contract step uses CHECK_MANIFEST.contract.{cmd,args}", () => {
    const expected = [(manifest as any).contract.cmd, ...(manifest as any).contract.args].join(" ");
    expect(findStepRun(parsed, "contract", /contract/)).toBe(expected);
  });

  it("work_id PR title regex comes from CHECK_MANIFEST.work_id.subject_pattern", () => {
    const run = findStepRun(parsed, "work-id-pr-title", /work-id PR title/);
    expect(run).toContain((manifest as any).work_id.subject_pattern);
  });
});
