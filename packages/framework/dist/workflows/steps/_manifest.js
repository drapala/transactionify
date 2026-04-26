"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manifest = void 0;
/**
 * Typed import of the codegened CHECK_MANIFEST. Centralises the
 * `import manifest from "../../generated/check-manifest.json"` cast
 * so the 5 step builders share the same typed surface (and the cast
 * lives in ONE place, not five).
 */
const check_manifest_json_1 = __importDefault(require("../../generated/check-manifest.json"));
exports.manifest = check_manifest_json_1.default;
