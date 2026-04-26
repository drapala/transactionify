"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClojureAdapter = void 0;
const errors_1 = require("./errors");
const STUB_MESSAGE = "Clojure adapter is a stub. See docs/adapters/clojure.md to implement RuntimeAdapter (packages/framework/src/adapters/runtime-adapter.ts).";
function fail() {
    throw new errors_1.NotImplementedError("clojure", STUB_MESSAGE);
}
class ClojureAdapter {
    stack = "clojure";
    lintCommand(_c) { return fail(); }
    unitTestCommand(_c) { return fail(); }
    pbtCommand(_c) { return fail(); }
    contractCommand(_c) { return fail(); }
    packageCommand(_c) { return fail(); }
}
exports.ClojureAdapter = ClojureAdapter;
