"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractStep = void 0;
const _manifest_1 = require("./_manifest");
const _shell_1 = require("./_shell");
function contractStep() {
    const m = _manifest_1.manifest.contract;
    return {
        name: "contract (schemathesis)",
        run: (0, _shell_1.joinArgs)(m.cmd, m.args),
    };
}
exports.contractStep = contractStep;
