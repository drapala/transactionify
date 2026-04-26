import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";
import { joinArgs } from "./_shell";

export function lintStep(): WorkflowStep {
  const m = manifest.lint;
  return {
    name: "lint",
    run: joinArgs(m.cmd, m.args),
  };
}
