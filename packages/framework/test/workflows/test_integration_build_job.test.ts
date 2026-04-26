/**
 * Closes the "attestation without build job" attack. attest-build-provenance
 * fails at runtime with 'subject-path: file not found' if no preceding
 * artifact exists; this test ensures (a) build job exists, (b) it uploads
 * an artifact, (c) attest needs build and references the artifact.
 */
import { describe, it, expect } from "vitest";
import { load as yamlLoad } from "js-yaml";
import { render } from "../../src/workflows/renderer";
import { generateIntegrationPipeline } from "../../src/workflows/integration-pipeline";
import { PythonAdapter } from "../../src/adapters/python";

const config = { project: "transactionify", stack: "python" as const, service_shape: "lambda" as const };
const adapter = new PythonAdapter();

describe("integration pipeline build → attest wiring", () => {
  const yaml = render(generateIntegrationPipeline(adapter, config));
  const parsed = yamlLoad(yaml) as any;

  it("build job exists", () => {
    expect(parsed.jobs.build).toBeDefined();
  });

  it("build job uploads a 'service-package' artifact", () => {
    const steps = parsed.jobs.build.steps as Array<any>;
    const upload = steps.find((s) => s.uses === "actions/upload-artifact@v4");
    expect(upload).toBeDefined();
    expect(upload.with.name).toBe("service-package");
  });

  it("attest needs build", () => {
    expect(parsed.jobs.attest.needs).toContain("build");
  });

  it("attest downloads + references the same artifact", () => {
    const steps = parsed.jobs.attest.steps as Array<any>;
    const dl = steps.find((s) => s.uses === "actions/download-artifact@v4");
    expect(dl).toBeDefined();
    expect(dl.with.name).toBe("service-package");
    const at = steps.find((s) => s.uses === "actions/attest-build-provenance@v1");
    expect(at).toBeDefined();
    expect(at.with["subject-path"]).toMatch(/artifact/);
  });
});
