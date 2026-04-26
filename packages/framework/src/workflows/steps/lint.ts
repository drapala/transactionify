import type { WorkflowStep } from "../renderer";
import manifest from "../../generated/check-manifest.json";

export function lintStep(): WorkflowStep {
  const m = (manifest as any).lint;
  return {
    name: "lint",
    run: [m.cmd as string, ...(m.args as string[])].join(" "),
  };
}
