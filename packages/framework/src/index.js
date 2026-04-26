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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7O0dBTUc7QUFDSCxpREFBOEM7QUFBckMsa0dBQUEsTUFBTSxPQUFBO0FBV2YsNENBSTJCO0FBSHpCLDZHQUFBLG1CQUFtQixPQUFBO0FBQ25CLCtHQUFBLHFCQUFxQixPQUFBO0FBQ3JCLDRHQUFBLGtCQUFrQixPQUFBO0FBRXBCLGdEQUF3RDtBQUEvQyxvR0FBQSxRQUFRLE9BQUE7QUFBRSxtR0FBQSxPQUFPLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFB1YmxpYyBzdXJmYWNlIG9mIEBnb2xkZW4tcGF0aC9mcmFtZXdvcmsuXG4gKlxuICogQ29uY3JldGUgcGlwZWxpbmUgc2hhcGUgKFBSICsgaW50ZWdyYXRpb24gd29ya2Zsb3dzKSBsYW5kcyBpbiBHUC0wMDcuXG4gKiBHUC0wMDYgc2hpcHMgdGhlIHJlbmRlcmVyICsgdGhlIGNvZGVnZW5lZCB0eXBlcyArIHRoZSBSdW50aW1lQWRhcHRlclxuICogcmVnaXN0cnkgKFB5dGhvbiByZWFsOyBHby9DbG9qdXJlL1R5cGVTY3JpcHQgc3R1YnMpLlxuICovXG5leHBvcnQgeyByZW5kZXIgfSBmcm9tIFwiLi93b3JrZmxvd3MvcmVuZGVyZXJcIjtcbmV4cG9ydCB0eXBlIHtcbiAgV29ya2Zsb3dQbGFuLFxuICBXb3JrZmxvd0pvYixcbiAgV29ya2Zsb3dTdGVwLFxuICBXb3JrZmxvd1RyaWdnZXIsXG59IGZyb20gXCIuL3dvcmtmbG93cy9yZW5kZXJlclwiO1xuZXhwb3J0IHR5cGUgeyBEb3JhRXZlbnQgfSBmcm9tIFwiLi90eXBlcy9kb3JhLWV2ZW50XCI7XG5leHBvcnQgdHlwZSB7IER4Q29uZmlnIH0gZnJvbSBcIi4vdHlwZXMvZHgtY29uZmlnXCI7XG5cbmV4cG9ydCB0eXBlIHsgUnVudGltZUFkYXB0ZXIsIEFkYXB0ZXJDb21tYW5kIH0gZnJvbSBcIi4vYWRhcHRlcnMvcnVudGltZS1hZGFwdGVyXCI7XG5leHBvcnQge1xuICBOb3RJbXBsZW1lbnRlZEVycm9yLFxuICBVbnN1cHBvcnRlZFN0YWNrRXJyb3IsXG4gIEFkYXB0ZXJDb25maWdFcnJvcixcbn0gZnJvbSBcIi4vYWRhcHRlcnMvZXJyb3JzXCI7XG5leHBvcnQgeyByZWdpc3RyeSwgcmVzb2x2ZSB9IGZyb20gXCIuL2FkYXB0ZXJzL3JlZ2lzdHJ5XCI7XG4iXX0=