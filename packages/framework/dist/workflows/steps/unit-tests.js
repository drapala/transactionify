"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitTestsStep = void 0;
const _manifest_1 = require("./_manifest");
function unitTestsStep(cwd) {
    const m = _manifest_1.manifest.unit_tests;
    return {
        name: "unit tests",
        run: [m.cmd, ...m.args].join(" "),
        workingDirectory: cwd,
    };
}
exports.unitTestsStep = unitTestsStep;
