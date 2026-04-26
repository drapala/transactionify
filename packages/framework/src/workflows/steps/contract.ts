import type { WorkflowStep } from "../renderer";
import manifest from "../../generated/check-manifest.json";

export function contractStep(): WorkflowStep {
  const m = (manifest as any).contract;
  return {
    name: "contract (schemathesis)",
    run: [m.cmd as string, ...(m.args as string[])].join(" "),
  };
}
