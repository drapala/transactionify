"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintStep = void 0;
const _manifest_1 = require("./_manifest");
function lintStep() {
    const m = _manifest_1.manifest.lint;
    return {
        name: "lint",
        run: [m.cmd, ...m.args].join(" "),
    };
}
exports.lintStep = lintStep;
