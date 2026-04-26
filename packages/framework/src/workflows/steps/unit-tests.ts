import type { WorkflowStep } from "../renderer";
import manifest from "../../generated/check-manifest.json";

export function unitTestsStep(cwd?: string): WorkflowStep {
  const m = (manifest as any).unit_tests;
  return {
    name: "unit tests",
    run: [m.cmd as string, ...(m.args as string[])].join(" "),
    workingDirectory: cwd,
  };
}
