"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const go_1 = require("../../src/adapters/go");
const errors_1 = require("../../src/adapters/errors");
const config = {
    project: "x",
    stack: "go",
    service_shape: "go" === "typescript" ? "wheel" : "binary",
};
(0, vitest_1.describe)("GoAdapter (stub)", () => {
    const a = new go_1.GoAdapter();
    const methods = [
        "lintCommand",
        "unitTestCommand",
        "pbtCommand",
        "contractCommand",
        "packageCommand",
    ];
    (0, vitest_1.it)("stack key matches 'go'", () => {
        (0, vitest_1.expect)(a.stack).toBe("go");
    });
    for (const m of methods) {
        (0, vitest_1.it)(`${m}() throws NotImplementedError pointing to docs/adapters/go.md`, () => {
            (0, vitest_1.expect)(() => a[m](config)).toThrow(errors_1.NotImplementedError);
            try {
                a[m](config);
            }
            catch (e) {
                (0, vitest_1.expect)(e.message).toMatch(/docs\/adapters\/go\.md/);
                (0, vitest_1.expect)(e.message).toMatch(/RuntimeAdapter/);
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ28tc3R1Yi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ28tc3R1Yi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQThDO0FBQzlDLDhDQUFrRDtBQUNsRCxzREFBZ0U7QUFHaEUsTUFBTSxNQUFNLEdBQWE7SUFDdkIsT0FBTyxFQUFFLEdBQUc7SUFDWixLQUFLLEVBQUUsSUFBSTtJQUNYLGFBQWEsRUFBRSxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQWU7Q0FDakUsQ0FBQztBQUVGLElBQUEsaUJBQVEsRUFBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFDaEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxjQUFTLEVBQUUsQ0FBQztJQUMxQixNQUFNLE9BQU8sR0FBRztRQUNkLGFBQWE7UUFDYixpQkFBaUI7UUFDakIsWUFBWTtRQUNaLGlCQUFpQjtRQUNqQixnQkFBZ0I7S0FDUixDQUFDO0lBRVgsSUFBQSxXQUFFLEVBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLElBQUEsZUFBTSxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLElBQUEsV0FBRSxFQUFDLEdBQUcsQ0FBQywrREFBK0QsRUFBRSxHQUFHLEVBQUU7WUFDM0UsSUFBQSxlQUFNLEVBQUMsR0FBRyxFQUFFLENBQUUsQ0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDRCQUFtQixDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDO2dCQUNGLENBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixDQUFDO1lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztnQkFDaEIsSUFBQSxlQUFNLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUNwRCxJQUFBLGVBQU0sRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVzY3JpYmUsIGl0LCBleHBlY3QgfSBmcm9tIFwidml0ZXN0XCI7XG5pbXBvcnQgeyBHb0FkYXB0ZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2FkYXB0ZXJzL2dvXCI7XG5pbXBvcnQgeyBOb3RJbXBsZW1lbnRlZEVycm9yIH0gZnJvbSBcIi4uLy4uL3NyYy9hZGFwdGVycy9lcnJvcnNcIjtcbmltcG9ydCB0eXBlIHsgRHhDb25maWcgfSBmcm9tIFwiLi4vLi4vc3JjL3R5cGVzL2R4LWNvbmZpZ1wiO1xuXG5jb25zdCBjb25maWc6IER4Q29uZmlnID0ge1xuICBwcm9qZWN0OiBcInhcIixcbiAgc3RhY2s6IFwiZ29cIixcbiAgc2VydmljZV9zaGFwZTogXCJnb1wiID09PSBcInR5cGVzY3JpcHRcIiA/IFwid2hlZWxcIiA6IFwiYmluYXJ5XCIgYXMgYW55LFxufTtcblxuZGVzY3JpYmUoXCJHb0FkYXB0ZXIgKHN0dWIpXCIsICgpID0+IHtcbiAgY29uc3QgYSA9IG5ldyBHb0FkYXB0ZXIoKTtcbiAgY29uc3QgbWV0aG9kcyA9IFtcbiAgICBcImxpbnRDb21tYW5kXCIsXG4gICAgXCJ1bml0VGVzdENvbW1hbmRcIixcbiAgICBcInBidENvbW1hbmRcIixcbiAgICBcImNvbnRyYWN0Q29tbWFuZFwiLFxuICAgIFwicGFja2FnZUNvbW1hbmRcIixcbiAgXSBhcyBjb25zdDtcblxuICBpdChcInN0YWNrIGtleSBtYXRjaGVzICdnbydcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChhLnN0YWNrKS50b0JlKFwiZ29cIik7XG4gIH0pO1xuXG4gIGZvciAoY29uc3QgbSBvZiBtZXRob2RzKSB7XG4gICAgaXQoYCR7bX0oKSB0aHJvd3MgTm90SW1wbGVtZW50ZWRFcnJvciBwb2ludGluZyB0byBkb2NzL2FkYXB0ZXJzL2dvLm1kYCwgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IChhIGFzIGFueSlbbV0oY29uZmlnKSkudG9UaHJvdyhOb3RJbXBsZW1lbnRlZEVycm9yKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIChhIGFzIGFueSlbbV0oY29uZmlnKTtcbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICBleHBlY3QoZS5tZXNzYWdlKS50b01hdGNoKC9kb2NzXFwvYWRhcHRlcnNcXC9nb1xcLm1kLyk7XG4gICAgICAgIGV4cGVjdChlLm1lc3NhZ2UpLnRvTWF0Y2goL1J1bnRpbWVBZGFwdGVyLyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuIl19