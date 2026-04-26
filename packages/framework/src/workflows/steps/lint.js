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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMkNBQXVDO0FBQ3ZDLHFDQUFvQztBQUVwQyxTQUFnQixRQUFRO0lBQ3RCLE1BQU0sQ0FBQyxHQUFHLG9CQUFRLENBQUMsSUFBSSxDQUFDO0lBQ3hCLE9BQU87UUFDTCxJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0tBQzdCLENBQUM7QUFDSixDQUFDO0FBTkQsNEJBTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFdvcmtmbG93U3RlcCB9IGZyb20gXCIuLi9yZW5kZXJlclwiO1xuaW1wb3J0IHsgbWFuaWZlc3QgfSBmcm9tIFwiLi9fbWFuaWZlc3RcIjtcbmltcG9ydCB7IGpvaW5BcmdzIH0gZnJvbSBcIi4vX3NoZWxsXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW50U3RlcCgpOiBXb3JrZmxvd1N0ZXAge1xuICBjb25zdCBtID0gbWFuaWZlc3QubGludDtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcImxpbnRcIixcbiAgICBydW46IGpvaW5BcmdzKG0uY21kLCBtLmFyZ3MpLFxuICB9O1xufVxuIl19