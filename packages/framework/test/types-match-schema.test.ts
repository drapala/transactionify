/**
 * Drift detector. Imports the codegen module directly, regenerates the
 * type strings in-memory, and compares against on-disk src/types/*.ts.
 * Any divergence fails the test with a clear "run pnpm codegen" message.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateAll, OUT_DIR } from "../scripts/codegen-types";

describe("type drift vs schema", () => {
  it("src/types/dora-event.ts matches codegen output (run `pnpm codegen` if this fails)", async () => {
    const { dora } = await generateAll();
    const onDisk = readFileSync(resolve(OUT_DIR, "dora-event.ts"), "utf8");
    expect(onDisk).toBe(dora);
  }, 30_000);

  it("src/types/dx-config.ts matches codegen output (run `pnpm codegen` if this fails)", async () => {
    const { dxConfig } = await generateAll();
    const onDisk = readFileSync(resolve(OUT_DIR, "dx-config.ts"), "utf8");
    expect(onDisk).toBe(dxConfig);
  }, 30_000);
});
