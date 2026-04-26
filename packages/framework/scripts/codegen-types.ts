/**
 * Codegen TypeScript types from packages/shared-schemas/*.schema.json.
 *
 * Idempotent: regenerating with the same schemas produces no diff. Tests
 * (test/types-match-schema.test.ts) re-run codegen and compare against the
 * on-disk types — drift fails CI loudly.
 *
 * Importable: `generateAll()` returns the compiled strings without writing,
 * so the drift test can compare without mutating the working tree.
 */
import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, type JSONSchema } from "json-schema-to-typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PKG_ROOT = resolve(__dirname, "..");
export const REPO_ROOT = resolve(PKG_ROOT, "..", "..");
export const SCHEMA_DIR = resolve(REPO_ROOT, "packages", "shared-schemas");
export const OUT_DIR = resolve(PKG_ROOT, "src", "types");

const BANNER = [
  "/* eslint-disable */",
  "/**",
  " * AUTO-GENERATED FILE — DO NOT EDIT.",
  " *",
  " * Source: packages/shared-schemas/*.schema.json (single source of truth).",
  " * Regenerate: `pnpm --filter @golden-path/framework codegen`.",
  " */",
].join("\n");

const COMPILE_OPTS = {
  bannerComment: BANNER,
  style: { singleQuote: false, semi: true, trailingComma: "all" as const },
  additionalProperties: false,
  format: true,
  unreachableDefinitions: false,
  strictIndexSignatures: false,
};

async function compileSchema(schemaFile: string, typeName: string): Promise<string> {
  const raw = readFileSync(resolve(SCHEMA_DIR, schemaFile), "utf8");
  const schema = JSON.parse(raw) as JSONSchema;
  // json-schema-to-typescript infers the type name from `title` first, then
  // from `$id`. Strip both so the explicit `typeName` argument wins
  // (DoraEvent / DxConfig).
  const cloned = JSON.parse(JSON.stringify(schema)) as JSONSchema;
  delete (cloned as Record<string, unknown>).title;
  delete (cloned as Record<string, unknown>).$id;
  return await compile(cloned, typeName, COMPILE_OPTS);
}

export async function generateAll(): Promise<{ dora: string; dxConfig: string }> {
  const [dora, dxConfig] = await Promise.all([
    compileSchema("dora-event.schema.json", "DoraEvent"),
    compileSchema("dx-config.schema.json", "DxConfig"),
  ]);
  return { dora, dxConfig };
}

async function main() {
  const { dora, dxConfig } = await generateAll();
  writeFileSync(resolve(OUT_DIR, "dora-event.ts"), dora);
  writeFileSync(resolve(OUT_DIR, "dx-config.ts"), dxConfig);
  // eslint-disable-next-line no-console
  console.log("codegen: wrote src/types/{dora-event,dx-config}.ts");
}

// Run main() only when invoked directly (`tsx scripts/codegen-types.ts`),
// not when imported by tests. import.meta.url comparison is the standard idiom.
const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
