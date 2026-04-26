/**
 * GoAdapter — STUB.
 *
 * The PDF names go as one of four polyglot targets. The registry resolves
 * 'go' to this adapter so the platform's polyglot stance is structural
 * (registry-shape) rather than aspirational. Method calls throw
 * NotImplementedError with a finger-post to docs/adapters/go.md, where
 * the contract for an InnerSource implementer is documented.
 *
 * Implementing this adapter for real costs ~2 days of work via the
 * RuntimeAdapter interface contract — see docs/adapters/go.md.
 */
import type { DxConfig } from "../types/dx-config";
import type { AdapterCommand, RuntimeAdapter } from "./runtime-adapter";
import { NotImplementedError } from "./errors";

const STUB_MESSAGE =
  "Go adapter is a stub. See docs/adapters/go.md to implement RuntimeAdapter (packages/framework/src/adapters/runtime-adapter.ts).";

function fail(): never {
  throw new NotImplementedError("go", STUB_MESSAGE);
}

export class GoAdapter implements RuntimeAdapter {
  readonly stack = "go" as const;
  lintCommand(_c: DxConfig): AdapterCommand     { return fail(); }
  unitTestCommand(_c: DxConfig): AdapterCommand { return fail(); }
  pbtCommand(_c: DxConfig): AdapterCommand      { return fail(); }
  contractCommand(_c: DxConfig): AdapterCommand { return fail(); }
  packageCommand(_c: DxConfig): AdapterCommand  { return fail(); }
}
