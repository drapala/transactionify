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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb250cmFjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyQ0FBdUM7QUFDdkMscUNBQW9DO0FBRXBDLFNBQWdCLFlBQVk7SUFDMUIsTUFBTSxDQUFDLEdBQUcsb0JBQVEsQ0FBQyxRQUFRLENBQUM7SUFDNUIsT0FBTztRQUNMLElBQUksRUFBRSx5QkFBeUI7UUFDL0IsR0FBRyxFQUFFLElBQUEsaUJBQVEsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDN0IsQ0FBQztBQUNKLENBQUM7QUFORCxvQ0FNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgV29ya2Zsb3dTdGVwIH0gZnJvbSBcIi4uL3JlbmRlcmVyXCI7XG5pbXBvcnQgeyBtYW5pZmVzdCB9IGZyb20gXCIuL19tYW5pZmVzdFwiO1xuaW1wb3J0IHsgam9pbkFyZ3MgfSBmcm9tIFwiLi9fc2hlbGxcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRyYWN0U3RlcCgpOiBXb3JrZmxvd1N0ZXAge1xuICBjb25zdCBtID0gbWFuaWZlc3QuY29udHJhY3Q7XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJjb250cmFjdCAoc2NoZW1hdGhlc2lzKVwiLFxuICAgIHJ1bjogam9pbkFyZ3MobS5jbWQsIG0uYXJncyksXG4gIH07XG59XG4iXX0=