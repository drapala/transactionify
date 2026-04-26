import { describe, it, expect } from "vitest";
import { TypescriptAdapter } from "../../src/adapters/typescript";
import { NotImplementedError } from "../../src/adapters/errors";
import type { DxConfig } from "../../src/types/dx-config";

const config: DxConfig = {
  project: "x",
  stack: "typescript",
  service_shape: "typescript" === "typescript" ? "wheel" : "binary" as any,
};

describe("TypescriptAdapter (stub)", () => {
  const a = new TypescriptAdapter();
  const methods = [
    "lintCommand",
    "unitTestCommand",
    "pbtCommand",
    "contractCommand",
    "packageCommand",
  ] as const;

  it("stack key matches 'typescript'", () => {
    expect(a.stack).toBe("typescript");
  });

  for (const m of methods) {
    it(`${m}() throws NotImplementedError pointing to docs/adapters/typescript.md`, () => {
      expect(() => (a as any)[m](config)).toThrow(NotImplementedError);
      try {
        (a as any)[m](config);
      } catch (e: any) {
        expect(e.message).toMatch(/docs\/adapters\/typescript\.md/);
        expect(e.message).toMatch(/RuntimeAdapter/);
      }
    });
  }
});
