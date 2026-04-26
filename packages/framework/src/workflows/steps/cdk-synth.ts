import type { WorkflowStep } from "../renderer";

export function cdkSynthStep(): WorkflowStep {
  return {
    name: "cdk synth",
    run: "npx tsc -p tsconfig.cdk.json && npx cdk synth --quiet",
  };
}

export function sandboxVerifyStep(): WorkflowStep {
  return {
    name: "sandbox verify (synth-only at PoC fidelity)",
    run: [
      "# Synth against a stub sandbox account/region. NO AWS credentials configured at PoC",
      "# fidelity — real cloud deploy is the ADR Future Integrations evolution path",
      "# (requires OIDC + sandbox AWS account, ~1d of plumbing).",
      "npx tsc -p tsconfig.cdk.json",
      "npx cdk synth --context account=000000000000 --context region=us-east-1 --quiet",
      "test -d cdk.out",
      "find cdk.out -maxdepth 1 -name '*.template.json' -print -quit | grep -q . || { echo 'no synthesised templates in cdk.out/'; exit 1; }",
    ].join("\n"),
  };
}
