"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitTestsStep = void 0;
const _manifest_1 = require("./_manifest");
const _shell_1 = require("./_shell");
function unitTestsStep(cwd) {
    const m = _manifest_1.manifest.unit_tests;
    return {
        name: "unit tests",
        run: (0, _shell_1.joinArgs)(m.cmd, m.args),
        workingDirectory: cwd,
    };
}
exports.unitTestsStep = unitTestsStep;
