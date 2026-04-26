import { describe, it, expect } from "vitest";
import { ClojureAdapter } from "../../src/adapters/clojure";
import { NotImplementedError } from "../../src/adapters/errors";
import type { DxConfig } from "../../src/types/dx-config";

const config: DxConfig = {
  project: "x",
  stack: "clojure",
  service_shape: "clojure" === "typescript" ? "wheel" : "binary" as any,
};

describe("ClojureAdapter (stub)", () => {
  const a = new ClojureAdapter();
  const methods = [
    "lintCommand",
    "unitTestCommand",
    "pbtCommand",
    "contractCommand",
    "packageCommand",
  ] as const;

  it("stack key matches 'clojure'", () => {
    expect(a.stack).toBe("clojure");
  });

  for (const m of methods) {
    it(`${m}() throws NotImplementedError pointing to docs/adapters/clojure.md`, () => {
      expect(() => (a as any)[m](config)).toThrow(NotImplementedError);
      try {
        (a as any)[m](config);
      } catch (e: any) {
        expect(e.message).toMatch(/docs\/adapters\/clojure\.md/);
        expect(e.message).toMatch(/RuntimeAdapter/);
      }
    });
  }
});
