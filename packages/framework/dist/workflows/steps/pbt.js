"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pbtStep = void 0;
const _manifest_1 = require("./_manifest");
const _shell_1 = require("./_shell");
function pbtStep(cwd) {
    const m = _manifest_1.manifest.pbt;
    return {
        name: "PBT (Hypothesis)",
        run: (0, _shell_1.joinArgs)(m.cmd, m.args),
        workingDirectory: cwd,
    };
}
exports.pbtStep = pbtStep;
