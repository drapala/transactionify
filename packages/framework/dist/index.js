"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.registry = exports.AdapterConfigError = exports.UnsupportedStackError = exports.NotImplementedError = exports.render = void 0;
/**
 * Public surface of @golden-path/framework.
 *
 * Concrete pipeline shape (PR + integration workflows) lands in GP-007.
 * GP-006 ships the renderer + the codegened types + the RuntimeAdapter
 * registry (Python real; Go/Clojure/TypeScript stubs).
 */
var renderer_1 = require("./workflows/renderer");
Object.defineProperty(exports, "render", { enumerable: true, get: function () { return renderer_1.render; } });
var errors_1 = require("./adapters/errors");
Object.defineProperty(exports, "NotImplementedError", { enumerable: true, get: function () { return errors_1.NotImplementedError; } });
Object.defineProperty(exports, "UnsupportedStackError", { enumerable: true, get: function () { return errors_1.UnsupportedStackError; } });
Object.defineProperty(exports, "AdapterConfigError", { enumerable: true, get: function () { return errors_1.AdapterConfigError; } });
var registry_1 = require("./adapters/registry");
Object.defineProperty(exports, "registry", { enumerable: true, get: function () { return registry_1.registry; } });
Object.defineProperty(exports, "resolve", { enumerable: true, get: function () { return registry_1.resolve; } });
