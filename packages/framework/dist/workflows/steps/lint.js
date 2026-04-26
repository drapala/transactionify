"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintStep = void 0;
const check_manifest_json_1 = __importDefault(require("../../generated/check-manifest.json"));
function lintStep() {
    const m = check_manifest_json_1.default.lint;
    return {
        name: "lint",
        run: [m.cmd, ...m.args].join(" "),
    };
}
exports.lintStep = lintStep;
