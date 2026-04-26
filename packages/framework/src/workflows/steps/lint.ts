import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";

export function lintStep(): WorkflowStep {
  const m = manifest.lint;
  return {
    name: "lint",
    run: [m.cmd, ...m.args].join(" "),
  };
}
