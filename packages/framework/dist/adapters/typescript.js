"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptAdapter = void 0;
const errors_1 = require("./errors");
const STUB_MESSAGE = "Typescript adapter is a stub. See docs/adapters/typescript.md to implement RuntimeAdapter (packages/framework/src/adapters/runtime-adapter.ts).";
function fail() {
    throw new errors_1.NotImplementedError("typescript", STUB_MESSAGE);
}
class TypescriptAdapter {
    stack = "typescript";
    lintCommand(_c) { return fail(); }
    unitTestCommand(_c) { return fail(); }
    pbtCommand(_c) { return fail(); }
    contractCommand(_c) { return fail(); }
    packageCommand(_c) { return fail(); }
}
exports.TypescriptAdapter = TypescriptAdapter;
