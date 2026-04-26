import { describe, it, expect } from "vitest";
import { load as yamlLoad } from "js-yaml";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "../../src/workflows/renderer";
import { generateIntegrationPipeline } from "../../src/workflows/integration-pipeline";
import { PythonAdapter } from "../../src/adapters/python";
import type { DxConfig } from "../../src/types/dx-config";

const FIXTURES = resolve(__dirname, "..", "fixtures");
const config: DxConfig = { project: "transactionify", stack: "python", service_shape: "lambda" };
const adapter = new PythonAdapter();

describe("generateIntegrationPipeline", () => {
  it("matches the golden fixture", () => {
    const fresh = render(generateIntegrationPipeline(adapter, config));
    const onDisk = readFileSync(resolve(FIXTURES, "expected-integration-pipeline.yml"), "utf8");
    expect(fresh).toBe(onDisk);
  });

  it("declares build, attest, deploy-staging, deploy-prod, dora-emit", () => {
    const j = (yamlLoad(render(generateIntegrationPipeline(adapter, config))) as any).jobs;
    expect(Object.keys(j)).toEqual(["build", "attest", "deploy-staging", "deploy-prod", "dora-emit"]);
  });

  it("attest needs build and declares id-token+attestations write permissions", () => {
    const j = (yamlLoad(render(generateIntegrationPipeline(adapter, config))) as any).jobs;
    expect(j.attest.needs).toContain("build");
    expect(j.attest.permissions["id-token"]).toBe("write");
    expect(j.attest.permissions.attestations).toBe("write");
    expect(j.attest.permissions.contents).toBe("read");
  });

  it("deploy-* jobs declare environments and chain via needs", () => {
    const j = (yamlLoad(render(generateIntegrationPipeline(adapter, config))) as any).jobs;
    expect(j["deploy-staging"].environment).toBe("staging");
    expect(j["deploy-prod"].environment).toBe("production");
    expect(j["deploy-staging"].needs).toContain("attest");
    expect(j["deploy-prod"].needs).toContain("deploy-staging");
  });

  it("dora-emit emits event_type=deployment with commit_authored_at and event_id", () => {
    const yaml = render(generateIntegrationPipeline(adapter, config));
    expect(yaml).toMatch(/event_type.*deployment/);
    expect(yaml).toMatch(/commit_authored_at/);
    expect(yaml).toMatch(/event_id/);
  });

  it("dora-emit has if: always()", () => {
    const j = (yamlLoad(render(generateIntegrationPipeline(adapter, config))) as any).jobs;
    expect(j["dora-emit"].if).toBe("always()");
  });
});
