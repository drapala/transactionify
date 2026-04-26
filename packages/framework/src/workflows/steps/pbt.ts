import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";

export function pbtStep(cwd?: string): WorkflowStep {
  const m = manifest.pbt;
  return {
    name: "PBT (Hypothesis)",
    run: [m.cmd, ...m.args].join(" "),
    workingDirectory: cwd,
  };
}
