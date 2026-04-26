import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";

export function contractStep(): WorkflowStep {
  const m = manifest.contract;
  return {
    name: "contract (schemathesis)",
    run: [m.cmd, ...m.args].join(" "),
  };
}
