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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDJDQUF1QztBQUN2QyxxQ0FBb0M7QUFFcEMsU0FBZ0IsT0FBTyxDQUFDLEdBQVk7SUFDbEMsTUFBTSxDQUFDLEdBQUcsb0JBQVEsQ0FBQyxHQUFHLENBQUM7SUFDdkIsT0FBTztRQUNMLElBQUksRUFBRSxrQkFBa0I7UUFDeEIsR0FBRyxFQUFFLElBQUEsaUJBQVEsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDNUIsZ0JBQWdCLEVBQUUsR0FBRztLQUN0QixDQUFDO0FBQ0osQ0FBQztBQVBELDBCQU9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBXb3JrZmxvd1N0ZXAgfSBmcm9tIFwiLi4vcmVuZGVyZXJcIjtcbmltcG9ydCB7IG1hbmlmZXN0IH0gZnJvbSBcIi4vX21hbmlmZXN0XCI7XG5pbXBvcnQgeyBqb2luQXJncyB9IGZyb20gXCIuL19zaGVsbFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcGJ0U3RlcChjd2Q/OiBzdHJpbmcpOiBXb3JrZmxvd1N0ZXAge1xuICBjb25zdCBtID0gbWFuaWZlc3QucGJ0O1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwiUEJUIChIeXBvdGhlc2lzKVwiLFxuICAgIHJ1bjogam9pbkFyZ3MobS5jbWQsIG0uYXJncyksXG4gICAgd29ya2luZ0RpcmVjdG9yeTogY3dkLFxuICB9O1xufVxuIl19