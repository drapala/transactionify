import { describe, it, expect } from "vitest";
import { GoAdapter } from "../../src/adapters/go";
import { NotImplementedError } from "../../src/adapters/errors";
import type { DxConfig } from "../../src/types/dx-config";

const config: DxConfig = {
  project: "x",
  stack: "go",
  service_shape: "go" === "typescript" ? "wheel" : "binary" as any,
};

describe("GoAdapter (stub)", () => {
  const a = new GoAdapter();
  const methods = [
    "lintCommand",
    "unitTestCommand",
    "pbtCommand",
    "contractCommand",
    "packageCommand",
  ] as const;

  it("stack key matches 'go'", () => {
    expect(a.stack).toBe("go");
  });

  for (const m of methods) {
    it(`${m}() throws NotImplementedError pointing to docs/adapters/go.md`, () => {
      expect(() => (a as any)[m](config)).toThrow(NotImplementedError);
      try {
        (a as any)[m](config);
      } catch (e: any) {
        expect(e.message).toMatch(/docs\/adapters\/go\.md/);
        expect(e.message).toMatch(/RuntimeAdapter/);
      }
    });
  }
});
