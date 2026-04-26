"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.registry = void 0;
const python_1 = require("./python");
const go_1 = require("./go");
const clojure_1 = require("./clojure");
const typescript_1 = require("./typescript");
const errors_1 = require("./errors");
/**
 * The registry is exported as a plain object so it survives CommonJS interop
 * (validation_commands does `require('./dist/adapters/registry').registry`).
 */
exports.registry = Object.freeze({
    python: () => new python_1.PythonAdapter(),
    go: () => new go_1.GoAdapter(),
    clojure: () => new clojure_1.ClojureAdapter(),
    typescript: () => new typescript_1.TypescriptAdapter(),
});
function resolve(stack) {
    const factory = exports.registry[stack];
    if (!factory) {
        throw new errors_1.UnsupportedStackError(stack, `stack '${stack}' is not registered. Add an adapter to extend support; see docs/adapters/.`);
    }
    return factory();
}
exports.resolve = resolve;
