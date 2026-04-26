"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintStep = void 0;
const _manifest_1 = require("./_manifest");
const _shell_1 = require("./_shell");
function lintStep() {
    const m = _manifest_1.manifest.lint;
    return {
        name: "lint",
        run: (0, _shell_1.joinArgs)(m.cmd, m.args),
    };
}
exports.lintStep = lintStep;
