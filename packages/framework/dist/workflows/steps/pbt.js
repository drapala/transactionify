"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pbtStep = void 0;
const _manifest_1 = require("./_manifest");
function pbtStep(cwd) {
    const m = _manifest_1.manifest.pbt;
    return {
        name: "PBT (Hypothesis)",
        run: [m.cmd, ...m.args].join(" "),
        workingDirectory: cwd,
    };
}
exports.pbtStep = pbtStep;
