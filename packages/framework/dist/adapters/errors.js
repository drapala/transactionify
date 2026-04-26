"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterConfigError = exports.UnsupportedStackError = exports.NotImplementedError = void 0;
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
class NotImplementedError extends Error {
    stack;
    constructor(stack, message) {
        super(message);
        this.name = "NotImplementedError";
        this.stack = stack;
    }
}
exports.NotImplementedError = NotImplementedError;
class UnsupportedStackError extends Error {
    stack;
    constructor(stack, message) {
        super(message);
        this.name = "UnsupportedStackError";
        this.stack = stack;
    }
}
exports.UnsupportedStackError = UnsupportedStackError;
class AdapterConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = "AdapterConfigError";
    }
}
exports.AdapterConfigError = AdapterConfigError;
