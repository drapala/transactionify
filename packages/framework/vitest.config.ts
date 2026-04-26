import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Set root to the repo root so positional file filters can be passed in their
// canonical "packages/framework/test/..." form (matches the way tickets and
// CI workflows reference paths). Include the framework's own tests only.
export default defineConfig({
  root: resolve(__dirname, "..", ".."),
  test: {
    include: ["packages/framework/test/**/*.test.ts"],
    environment: "node",
  },
});
