/**
 * Regenerate .github/workflows/{pr,integration}.yml from the framework's
 * generators. Idempotent — running twice in a clean tree produces no diff
 * (validation_command #5 enforces this with `git diff --exit-code`).
 *
 * Run: `pnpm tsx scripts/regenerate-workflows.ts`
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// Step 1: regenerate fixtures (the canonical generator output).
execFileSync(
  "pnpm",
  ["--filter", "@golden-path/framework", "run", "gen-fixtures"],
  { cwd: REPO_ROOT, stdio: "inherit" },
);

// Step 2: copy fixtures to .github/workflows/ with deployment-friendly names.
// The framework's vitest snapshot test already asserts the YAML is parseable
// and actionlint-clean — no need to re-validate here.
const FIXTURES = resolve(REPO_ROOT, "packages", "framework", "test", "fixtures");
const OUT = resolve(REPO_ROOT, ".github", "workflows");
mkdirSync(OUT, { recursive: true });

const mapping: Array<[string, string]> = [
  ["expected-pr-pipeline.yml", "pr.yml"],
  ["expected-integration-pipeline.yml", "integration.yml"],
];

for (const [from, to] of mapping) {
  const src = resolve(FIXTURES, from);
  const dst = resolve(OUT, to);
  writeFileSync(dst, readFileSync(src));
  // eslint-disable-next-line no-console
  console.log(`regenerate-workflows: ${from} → .github/workflows/${to}`);
}
