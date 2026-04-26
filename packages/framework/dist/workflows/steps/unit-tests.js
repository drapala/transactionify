"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitTestsStep = void 0;
const check_manifest_json_1 = __importDefault(require("../../generated/check-manifest.json"));
function unitTestsStep(cwd) {
    const m = check_manifest_json_1.default.unit_tests;
    return {
        name: "unit tests",
        run: [m.cmd, ...m.args].join(" "),
        workingDirectory: cwd,
    };
}
exports.unitTestsStep = unitTestsStep;
