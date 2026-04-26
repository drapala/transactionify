import type { WorkflowStep } from "../renderer";
import { manifest } from "./_manifest";
import { joinArgs } from "./_shell";

export function contractStep(): WorkflowStep {
  const m = manifest.contract;
  return {
    name: "contract (schemathesis)",
    run: joinArgs(m.cmd, m.args),
  };
}
