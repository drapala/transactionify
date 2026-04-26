"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractStep = void 0;
const check_manifest_json_1 = __importDefault(require("../../generated/check-manifest.json"));
function contractStep() {
    const m = check_manifest_json_1.default.contract;
    return {
        name: "contract (schemathesis)",
        run: [m.cmd, ...m.args].join(" "),
    };
}
exports.contractStep = contractStep;
