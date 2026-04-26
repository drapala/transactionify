import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";
import { joinArgs } from "./_shell";

export function pbtStep(cwd?: string): WorkflowStep {
  const m = manifest.pbt;
  return {
    name: "PBT (Hypothesis)",
    run: joinArgs(m.cmd, m.args),
    workingDirectory: cwd,
  };
}
