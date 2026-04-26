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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pdC10ZXN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVuaXQtdGVzdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMkNBQXVDO0FBQ3ZDLHFDQUFvQztBQUVwQyxTQUFnQixhQUFhLENBQUMsR0FBWTtJQUN4QyxNQUFNLENBQUMsR0FBRyxvQkFBUSxDQUFDLFVBQVUsQ0FBQztJQUM5QixPQUFPO1FBQ0wsSUFBSSxFQUFFLFlBQVk7UUFDbEIsR0FBRyxFQUFFLElBQUEsaUJBQVEsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDNUIsZ0JBQWdCLEVBQUUsR0FBRztLQUN0QixDQUFDO0FBQ0osQ0FBQztBQVBELHNDQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBXb3JrZmxvd1N0ZXAgfSBmcm9tIFwiLi4vcmVuZGVyZXJcIjtcbmltcG9ydCB7IG1hbmlmZXN0IH0gZnJvbSBcIi4vX21hbmlmZXN0XCI7XG5pbXBvcnQgeyBqb2luQXJncyB9IGZyb20gXCIuL19zaGVsbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gdW5pdFRlc3RzU3RlcChjd2Q/OiBzdHJpbmcpOiBXb3JrZmxvd1N0ZXAge1xuICBjb25zdCBtID0gbWFuaWZlc3QudW5pdF90ZXN0cztcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInVuaXQgdGVzdHNcIixcbiAgICBydW46IGpvaW5BcmdzKG0uY21kLCBtLmFyZ3MpLFxuICAgIHdvcmtpbmdEaXJlY3Rvcnk6IGN3ZCxcbiAgfTtcbn1cbiJdfQ==