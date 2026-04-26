import { describe, it, expect } from "vitest";
import { load as yamlLoad } from "js-yaml";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render, type WorkflowPlan } from "../src/workflows/renderer";

const minimalPlan: WorkflowPlan = {
  name: "PR",
  on: { pull_request: { branches: ["main"] } },
  env: { AWS_DEFAULT_REGION: "us-east-1" },
  jobs: [
    {
      id: "lint",
      runsOn: "ubuntu-latest",
      steps: [
        { name: "checkout", uses: "actions/checkout@v4" },
        { name: "ruff", run: "ruff check ." },
      ],
    },
    {
      id: "unit",
      runsOn: "ubuntu-latest",
      needs: ["lint"],
      steps: [{ name: "pytest", run: "uv run pytest" }],
    },
  ],
};

describe("renderer.render", () => {
  it("emits YAML parseable by js-yaml", () => {
    const yaml = render(minimalPlan);
    const parsed = yamlLoad(yaml) as Record<string, unknown>;
    expect(parsed.name).toBe("PR");
    expect(parsed.jobs).toBeDefined();
  });

  it("preserves step ordering", () => {
    const yaml = render(minimalPlan);
    const checkoutIdx = yaml.indexOf("checkout");
    const ruffIdx = yaml.indexOf("ruff");
    expect(checkoutIdx).toBeGreaterThan(0);
    expect(ruffIdx).toBeGreaterThan(checkoutIdx);
  });

  it("preserves job dependency declarations", () => {
    const yaml = render(minimalPlan);
    const parsed = yamlLoad(yaml) as { jobs: Record<string, { needs?: string[] }> };
    expect(parsed.jobs.unit.needs).toEqual(["lint"]);
  });

  it("rejects empty plan name", () => {
    expect(() => render({ ...minimalPlan, name: "" })).toThrow(/name/);
  });

  it("rejects plan without jobs", () => {
    expect(() => render({ ...minimalPlan, jobs: [] })).toThrow(/jobs/);
  });

  it("output passes actionlint when actionlint is on PATH", () => {
    let actionlintAvailable = true;
    try {
      execFileSync("actionlint", ["-version"], { stdio: "ignore" });
    } catch {
      actionlintAvailable = false;
    }
    if (!actionlintAvailable) {
      // actionlint absent locally → skip (CI installs it via tests/workspace/test_workspace_health.sh).
      return;
    }
    const yaml = render(minimalPlan);
    const dir = mkdtempSync(join(tmpdir(), "gp-renderer-"));
    const wfDir = join(dir, ".github", "workflows");
    execFileSync("mkdir", ["-p", wfDir]);
    const wfPath = join(wfDir, "pr.yml");
    writeFileSync(wfPath, yaml);
    // actionlint exits 0 on clean files.
    execFileSync("actionlint", [wfPath], { stdio: "inherit" });
  });
});
