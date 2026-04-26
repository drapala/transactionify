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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsTUFBYSxtQkFBb0IsU0FBUSxLQUFLO0lBQ25DLEtBQUssQ0FBUztJQUN2QixZQUFZLEtBQWEsRUFBRSxPQUFlO1FBQ3hDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcscUJBQXFCLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztDQUNGO0FBUEQsa0RBT0M7QUFFRCxNQUFhLHFCQUFzQixTQUFRLEtBQUs7SUFDckMsS0FBSyxDQUFTO0lBQ3ZCLFlBQVksS0FBYSxFQUFFLE9BQWU7UUFDeEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyx1QkFBdUIsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0NBQ0Y7QUFQRCxzREFPQztBQUVELE1BQWEsa0JBQW1CLFNBQVEsS0FBSztJQUMzQyxZQUFZLE9BQWU7UUFDekIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFMRCxnREFLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQWRhcHRlciBlcnJvciB0YXhvbm9teS5cbiAqXG4gKiBOb3RJbXBsZW1lbnRlZEVycm9yIOKAlCB0aHJvd24gYnkgc3R1YiBhZGFwdGVycyAoR28sIENsb2p1cmUsIFR5cGVTY3JpcHQpLlxuICogICBFYWNoIGluc3RhbmNlIGNhcnJpZXMgdGhlIHN0YWNrIG5hbWUgYW5kIGEgcG9pbnRlciB0byB0aGUgcGVyLXN0YWNrIGRvY1xuICogICBzbyB0aGUgZmFpbHVyZSBtb2RlIGlzIGEgZmluZ2VyLXBvc3QsIG5vdCBhIHdhbGwuXG4gKlxuICogVW5zdXBwb3J0ZWRTdGFja0Vycm9yIOKAlCB0aHJvd24gYnkgdGhlIHJlZ2lzdHJ5IHdoZW4gYSAuZHgueWFtbCByZXF1ZXN0cyBhXG4gKiAgIHN0YWNrIHRoYXQgaXMgbm90IGluIHRoZSBmb3VyIFBERi1uYW1lZCBzdGFja3MgKHB5dGhvbiwgZ28sIGNsb2p1cmUsXG4gKiAgIHR5cGVzY3JpcHQpLiBBZGRpbmcgYSBzdGFjayBtZWFucyB3cml0aW5nIGFuIGFkYXB0ZXIg4oCUIHRoZSBJbm5lclNvdXJjZVxuICogICBwYXRoIHRoZSBwbGF0Zm9ybSBkZWxpYmVyYXRlbHkgbGVhdmVzIG9wZW4uXG4gKi9cbmV4cG9ydCBjbGFzcyBOb3RJbXBsZW1lbnRlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICByZWFkb25seSBzdGFjazogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihzdGFjazogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSBcIk5vdEltcGxlbWVudGVkRXJyb3JcIjtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVuc3VwcG9ydGVkU3RhY2tFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcmVhZG9ubHkgc3RhY2s6IHN0cmluZztcbiAgY29uc3RydWN0b3Ioc3RhY2s6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJVbnN1cHBvcnRlZFN0YWNrRXJyb3JcIjtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFkYXB0ZXJDb25maWdFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJBZGFwdGVyQ29uZmlnRXJyb3JcIjtcbiAgfVxufVxuIl19