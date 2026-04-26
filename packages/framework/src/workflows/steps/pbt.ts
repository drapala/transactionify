import type { WorkflowStep } from "../renderer";
import manifest from "../../generated/check-manifest.json";

export function pbtStep(cwd?: string): WorkflowStep {
  const m = (manifest as any).pbt;
  return {
    name: "PBT (Hypothesis)",
    run: [m.cmd as string, ...(m.args as string[])].join(" "),
    workingDirectory: cwd,
  };
}
