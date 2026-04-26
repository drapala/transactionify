import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { extractBlockingJobsFromWorkflow, extractBlockingJobsFromWorkflowText, buildDefaultRuleset } from "../../src/governance/rulesets";

const FIXTURE = resolve(__dirname, "..", "fixtures", "expected-pr-pipeline.yml");

describe("extractBlockingJobsFromWorkflow", () => {
  it("excludes ai-review (continue-on-error) and dora-emit (if: always())", () => {
    const blocking = extractBlockingJobsFromWorkflow(FIXTURE);
    expect(blocking).not.toContain("ai-review");
    expect(blocking).not.toContain("dora-emit");
  });

  it("includes the canonical sandbox-verify name (NOT deploy-sandbox)", () => {
    const blocking = extractBlockingJobsFromWorkflow(FIXTURE);
    expect(blocking).toContain("sandbox-verify");
    expect(blocking).not.toContain("deploy-sandbox");
  });

  it("includes lint, unit-tests, pbt, contract, work-id-pr-title, cdk-synth, sandbox-verify", () => {
    const blocking = extractBlockingJobsFromWorkflow(FIXTURE);
    for (const j of ["lint", "unit-tests", "pbt", "contract", "work-id-pr-title", "cdk-synth", "sandbox-verify"]) {
      expect(blocking).toContain(j);
    }
  });

  it("text-based variant works when caller already has the YAML in memory", () => {
    const text = readFileSync(FIXTURE, "utf8");
    expect(extractBlockingJobsFromWorkflowText(text).length).toBeGreaterThan(0);
  });
});

describe("buildDefaultRuleset", () => {
  it("produces the GitHub Rulesets API shape (target string + conditions.ref_name.include)", () => {
    const rs = buildDefaultRuleset({ requiredChecks: ["lint", "unit-tests"] });
    expect(rs.target).toBe("branch");
    expect(rs.conditions.ref_name.include).toEqual(["refs/heads/main"]);
    expect(rs.enforcement).toBe("active");
    // ensure no non-existent `target.include` shape sneaked in
    expect((rs as any).target.include).toBeUndefined();
  });

  it("required reviewers default to 2", () => {
    const rs = buildDefaultRuleset({ requiredChecks: ["lint"] });
    const pr = rs.rules.find((r) => r.type === "pull_request") as any;
    expect(pr.parameters.required_approving_review_count).toBe(2);
  });

  it("required_status_checks contexts come from the input list (NOT hardcoded)", () => {
    const rs = buildDefaultRuleset({ requiredChecks: ["lint", "unit-tests", "pbt"] });
    const rsc = rs.rules.find((r) => r.type === "required_status_checks") as any;
    expect(rsc.parameters.required_status_checks.map((c: any) => c.context)).toEqual(["lint", "unit-tests", "pbt"]);
  });

  it("includes deletion + non_fast_forward by default", () => {
    const rs = buildDefaultRuleset({ requiredChecks: ["lint"] });
    expect(rs.rules.some((r) => r.type === "deletion")).toBe(true);
    expect(rs.rules.some((r) => r.type === "non_fast_forward")).toBe(true);
  });

  it("does NOT include required_signatures by default (P0-7)", () => {
    const rs = buildDefaultRuleset({ requiredChecks: ["lint"] });
    expect(rs.rules.some((r) => r.type === "required_signatures")).toBe(false);
  });

  it("includes required_signatures when signedCommits opt-in", () => {
    const rs = buildDefaultRuleset({ requiredChecks: ["lint"], signedCommits: true });
    expect(rs.rules.some((r) => r.type === "required_signatures")).toBe(true);
  });

  it("throws when requiredChecks is empty (no protection theater)", () => {
    expect(() => buildDefaultRuleset({ requiredChecks: [] })).toThrow(/requiredChecks/);
  });

  it("end-to-end: extractBlockingJobsFromWorkflow → buildDefaultRuleset produces valid contexts", () => {
    const blocking = extractBlockingJobsFromWorkflow(FIXTURE);
    const rs = buildDefaultRuleset({ requiredChecks: blocking });
    const rsc = rs.rules.find((r) => r.type === "required_status_checks") as any;
    expect(rsc.parameters.required_status_checks.length).toBe(blocking.length);
  });
});
