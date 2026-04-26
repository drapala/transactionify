import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";

export function unitTestsStep(cwd?: string): WorkflowStep {
  const m = manifest.unit_tests;
  return {
    name: "unit tests",
    run: [m.cmd, ...m.args].join(" "),
    workingDirectory: cwd,
  };
}
