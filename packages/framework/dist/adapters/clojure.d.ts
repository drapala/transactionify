/**
 * ClojureAdapter — STUB.
 *
 * The PDF names clojure as one of four polyglot targets. The registry resolves
 * 'clojure' to this adapter so the platform's polyglot stance is structural
 * (registry-shape) rather than aspirational. Method calls throw
 * NotImplementedError with a finger-post to docs/adapters/clojure.md, where
 * the contract for an InnerSource implementer is documented.
 *
 * Implementing this adapter for real costs ~2 days of work via the
 * RuntimeAdapter interface contract — see docs/adapters/clojure.md.
 */
import type { DxConfig } from "../types/dx-config";
import type { AdapterCommand, RuntimeAdapter } from "./runtime-adapter";
export declare class ClojureAdapter implements RuntimeAdapter {
    readonly stack: "clojure";
    lintCommand(_c: DxConfig): AdapterCommand;
    unitTestCommand(_c: DxConfig): AdapterCommand;
    pbtCommand(_c: DxConfig): AdapterCommand;
    contractCommand(_c: DxConfig): AdapterCommand;
    packageCommand(_c: DxConfig): AdapterCommand;
}
