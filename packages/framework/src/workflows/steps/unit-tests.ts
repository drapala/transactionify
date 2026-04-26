import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";
import { joinArgs } from "./_shell";

export function unitTestsStep(cwd?: string): WorkflowStep {
  const m = manifest.unit_tests;
  return {
    name: "unit tests",
    run: joinArgs(m.cmd, m.args),
    workingDirectory: cwd,
  };
}
