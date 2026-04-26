import { describe, it, expect } from "vitest";
import { registry, resolve } from "../../src/adapters/registry";
import { PythonAdapter } from "../../src/adapters/python";
import { GoAdapter } from "../../src/adapters/go";
import { ClojureAdapter } from "../../src/adapters/clojure";
import { TypescriptAdapter } from "../../src/adapters/typescript";
import { NotImplementedError, UnsupportedStackError } from "../../src/adapters/errors";

describe("adapter registry", () => {
  it("keys are EXACTLY the four PDF-named stacks (no missing, no extra)", () => {
    expect(Object.keys(registry).sort()).toEqual(["clojure", "go", "python", "typescript"]);
  });

  it("resolve('python') returns a PythonAdapter", () => {
    expect(resolve("python")).toBeInstanceOf(PythonAdapter);
  });

  it("resolve('go') returns a GoAdapter (resolution succeeds; methods fail)", () => {
    expect(resolve("go")).toBeInstanceOf(GoAdapter);
  });

  it("resolve('clojure') returns a ClojureAdapter", () => {
    expect(resolve("clojure")).toBeInstanceOf(ClojureAdapter);
  });

  it("resolve('typescript') returns a TypescriptAdapter", () => {
    expect(resolve("typescript")).toBeInstanceOf(TypescriptAdapter);
  });

  it("resolve('rust') throws UnsupportedStackError with InnerSource hint", () => {
    expect(() => resolve("rust")).toThrow(UnsupportedStackError);
    try {
      resolve("rust");
    } catch (e: any) {
      expect(e.message).toMatch(/add an adapter/i);
      expect(e.message).toMatch(/docs\/adapters\//);
    }
  });

  it("stub method calls (not registry resolution) throw NotImplementedError", () => {
    const go = resolve("go");
    expect(() => go.lintCommand({ project: "x", stack: "go", service_shape: "binary" })).toThrow(
      NotImplementedError,
    );
  });
});
