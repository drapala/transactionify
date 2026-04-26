import { describe, it, expectTypeOf } from "vitest";
import type { RuntimeAdapter, AdapterCommand } from "../../src/adapters/runtime-adapter";

describe("RuntimeAdapter interface", () => {
  it("declares the five contract methods", () => {
    // Compile-time check: any object satisfying RuntimeAdapter must expose
    // exactly these five methods. expectTypeOf fails compilation if the
    // interface drifts.
    expectTypeOf<RuntimeAdapter>().toHaveProperty("lintCommand");
    expectTypeOf<RuntimeAdapter>().toHaveProperty("unitTestCommand");
    expectTypeOf<RuntimeAdapter>().toHaveProperty("pbtCommand");
    expectTypeOf<RuntimeAdapter>().toHaveProperty("contractCommand");
    expectTypeOf<RuntimeAdapter>().toHaveProperty("packageCommand");
  });

  it("AdapterCommand has structured cmd/args (not raw shell)", () => {
    expectTypeOf<AdapterCommand>().toHaveProperty("cmd").toEqualTypeOf<string>();
    expectTypeOf<AdapterCommand>().toHaveProperty("args").toEqualTypeOf<string[]>();
  });
});
