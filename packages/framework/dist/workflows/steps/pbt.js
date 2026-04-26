"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pbtStep = void 0;
const check_manifest_json_1 = __importDefault(require("../../generated/check-manifest.json"));
function pbtStep(cwd) {
    const m = check_manifest_json_1.default.pbt;
    return {
        name: "PBT (Hypothesis)",
        run: [m.cmd, ...m.args].join(" "),
        workingDirectory: cwd,
    };
}
exports.pbtStep = pbtStep;
