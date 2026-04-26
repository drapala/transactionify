import { describe, it, expect } from "vitest";
import { PythonAdapter } from "../../src/adapters/python";
import { AdapterConfigError } from "../../src/adapters/errors";
import type { DxConfig } from "../../src/types/dx-config";

const baseLambda: DxConfig = {
  project: "transactionify",
  stack: "python",
  service_shape: "lambda",
};

const baseWheel: DxConfig = {
  project: "lib",
  stack: "python",
  service_shape: "wheel",
};

describe("PythonAdapter", () => {
  const a = new PythonAdapter();

  it("lintCommand returns ruff check .", () => {
    expect(a.lintCommand(baseLambda)).toEqual({ cmd: "ruff", args: ["check", "."] });
  });

  it("unitTestCommand selects -m 'not pbt' and uses default test_root for lambda", () => {
    expect(a.unitTestCommand(baseLambda)).toEqual({
      cmd: "pytest",
      args: ["-x", "-q", "-m", "not pbt"],
      cwd: "test/unit/src/python",
    });
  });

  it("unitTestCommand uses 'tests' as default test_root for wheel", () => {
    expect(a.unitTestCommand(baseWheel)).toEqual({
      cmd: "pytest",
      args: ["-x", "-q", "-m", "not pbt"],
      cwd: "tests",
    });
  });

  it("test_root override from .dx.yaml wins", () => {
    expect(a.unitTestCommand({ ...baseLambda, test_root: "custom/path" })).toEqual({
      cmd: "pytest",
      args: ["-x", "-q", "-m", "not pbt"],
      cwd: "custom/path",
    });
  });

  it("pbtCommand selects -m pbt and shares cwd with unit", () => {
    expect(a.pbtCommand(baseLambda)).toEqual({
      cmd: "pytest",
      args: ["-x", "-q", "-m", "pbt"],
      cwd: "test/unit/src/python",
    });
  });

  it("contractCommand returns schemathesis", () => {
    expect(a.contractCommand(baseLambda).cmd).toBe("schemathesis");
  });

  it("packageCommand for lambda emits cdk synth + tar bundle", () => {
    const cmd = a.packageCommand(baseLambda);
    expect(cmd.cmd).toBe("sh");
    expect(cmd.args[0]).toBe("-c");
    expect(cmd.args[1]).toMatch(/cdk synth/);
    expect(cmd.args[1]).toMatch(/tar -czf service-package\.tgz cdk\.out\//);
  });

  it("packageCommand for wheel emits uv build", () => {
    expect(a.packageCommand(baseWheel)).toEqual({ cmd: "uv", args: ["build"] });
  });

  it("packageCommand for binary fails with actionable message", () => {
    expect(() =>
      a.packageCommand({ ...baseLambda, service_shape: "binary" }),
    ).toThrow(AdapterConfigError);
  });
});
