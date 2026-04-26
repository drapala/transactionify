/**
 * Adapter error taxonomy.
 *
 * NotImplementedError — thrown by stub adapters (Go, Clojure, TypeScript).
 *   Each instance carries the stack name and a pointer to the per-stack doc
 *   so the failure mode is a finger-post, not a wall.
 *
 * UnsupportedStackError — thrown by the registry when a .dx.yaml requests a
 *   stack that is not in the four PDF-named stacks (python, go, clojure,
 *   typescript). Adding a stack means writing an adapter — the InnerSource
 *   path the platform deliberately leaves open.
 */
export declare class NotImplementedError extends Error {
    readonly stack: string;
    constructor(stack: string, message: string);
}
export declare class UnsupportedStackError extends Error {
    readonly stack: string;
    constructor(stack: string, message: string);
}
export declare class AdapterConfigError extends Error {
    constructor(message: string);
}
