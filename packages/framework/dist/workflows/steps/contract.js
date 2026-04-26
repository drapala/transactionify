"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractStep = void 0;
const _manifest_1 = require("./_manifest");
function contractStep() {
    const m = _manifest_1.manifest.contract;
    return {
        name: "contract (schemathesis)",
        run: [m.cmd, ...m.args].join(" "),
    };
}
exports.contractStep = contractStep;
