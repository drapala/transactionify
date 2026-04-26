/**
 * TypescriptAdapter — STUB.
 *
 * The PDF names typescript as one of four polyglot targets. The registry resolves
 * 'typescript' to this adapter so the platform's polyglot stance is structural
 * (registry-shape) rather than aspirational. Method calls throw
 * NotImplementedError with a finger-post to docs/adapters/typescript.md, where
 * the contract for an InnerSource implementer is documented.
 *
 * Implementing this adapter for real costs ~2 days of work via the
 * RuntimeAdapter interface contract — see docs/adapters/typescript.md.
 */
import type { DxConfig } from "../types/dx-config";
import type { AdapterCommand, RuntimeAdapter } from "./runtime-adapter";
export declare class TypescriptAdapter implements RuntimeAdapter {
    readonly stack: "typescript";
    lintCommand(_c: DxConfig): AdapterCommand;
    unitTestCommand(_c: DxConfig): AdapterCommand;
    pbtCommand(_c: DxConfig): AdapterCommand;
    contractCommand(_c: DxConfig): AdapterCommand;
    packageCommand(_c: DxConfig): AdapterCommand;
}
