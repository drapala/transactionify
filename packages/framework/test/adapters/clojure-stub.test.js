"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const clojure_1 = require("../../src/adapters/clojure");
const errors_1 = require("../../src/adapters/errors");
const config = {
    project: "x",
    stack: "clojure",
    service_shape: "clojure" === "typescript" ? "wheel" : "binary",
};
(0, vitest_1.describe)("ClojureAdapter (stub)", () => {
    const a = new clojure_1.ClojureAdapter();
    const methods = [
        "lintCommand",
        "unitTestCommand",
        "pbtCommand",
        "contractCommand",
        "packageCommand",
    ];
    (0, vitest_1.it)("stack key matches 'clojure'", () => {
        (0, vitest_1.expect)(a.stack).toBe("clojure");
    });
    for (const m of methods) {
        (0, vitest_1.it)(`${m}() throws NotImplementedError pointing to docs/adapters/clojure.md`, () => {
            (0, vitest_1.expect)(() => a[m](config)).toThrow(errors_1.NotImplementedError);
            try {
                a[m](config);
            }
            catch (e) {
                (0, vitest_1.expect)(e.message).toMatch(/docs\/adapters\/clojure\.md/);
                (0, vitest_1.expect)(e.message).toMatch(/RuntimeAdapter/);
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvanVyZS1zdHViLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbG9qdXJlLXN0dWIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4QztBQUM5Qyx3REFBNEQ7QUFDNUQsc0RBQWdFO0FBR2hFLE1BQU0sTUFBTSxHQUFhO0lBQ3ZCLE9BQU8sRUFBRSxHQUFHO0lBQ1osS0FBSyxFQUFFLFNBQVM7SUFDaEIsYUFBYSxFQUFFLFNBQVMsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBZTtDQUN0RSxDQUFDO0FBRUYsSUFBQSxpQkFBUSxFQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtJQUNyQyxNQUFNLENBQUMsR0FBRyxJQUFJLHdCQUFjLEVBQUUsQ0FBQztJQUMvQixNQUFNLE9BQU8sR0FBRztRQUNkLGFBQWE7UUFDYixpQkFBaUI7UUFDakIsWUFBWTtRQUNaLGlCQUFpQjtRQUNqQixnQkFBZ0I7S0FDUixDQUFDO0lBRVgsSUFBQSxXQUFFLEVBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLElBQUEsZUFBTSxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLElBQUEsV0FBRSxFQUFDLEdBQUcsQ0FBQyxvRUFBb0UsRUFBRSxHQUFHLEVBQUU7WUFDaEYsSUFBQSxlQUFNLEVBQUMsR0FBRyxFQUFFLENBQUUsQ0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDRCQUFtQixDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDO2dCQUNGLENBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixDQUFDO1lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztnQkFDaEIsSUFBQSxlQUFNLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO2dCQUN6RCxJQUFBLGVBQU0sRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVzY3JpYmUsIGl0LCBleHBlY3QgfSBmcm9tIFwidml0ZXN0XCI7XG5pbXBvcnQgeyBDbG9qdXJlQWRhcHRlciB9IGZyb20gXCIuLi8uLi9zcmMvYWRhcHRlcnMvY2xvanVyZVwiO1xuaW1wb3J0IHsgTm90SW1wbGVtZW50ZWRFcnJvciB9IGZyb20gXCIuLi8uLi9zcmMvYWRhcHRlcnMvZXJyb3JzXCI7XG5pbXBvcnQgdHlwZSB7IER4Q29uZmlnIH0gZnJvbSBcIi4uLy4uL3NyYy90eXBlcy9keC1jb25maWdcIjtcblxuY29uc3QgY29uZmlnOiBEeENvbmZpZyA9IHtcbiAgcHJvamVjdDogXCJ4XCIsXG4gIHN0YWNrOiBcImNsb2p1cmVcIixcbiAgc2VydmljZV9zaGFwZTogXCJjbG9qdXJlXCIgPT09IFwidHlwZXNjcmlwdFwiID8gXCJ3aGVlbFwiIDogXCJiaW5hcnlcIiBhcyBhbnksXG59O1xuXG5kZXNjcmliZShcIkNsb2p1cmVBZGFwdGVyIChzdHViKVwiLCAoKSA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgQ2xvanVyZUFkYXB0ZXIoKTtcbiAgY29uc3QgbWV0aG9kcyA9IFtcbiAgICBcImxpbnRDb21tYW5kXCIsXG4gICAgXCJ1bml0VGVzdENvbW1hbmRcIixcbiAgICBcInBidENvbW1hbmRcIixcbiAgICBcImNvbnRyYWN0Q29tbWFuZFwiLFxuICAgIFwicGFja2FnZUNvbW1hbmRcIixcbiAgXSBhcyBjb25zdDtcblxuICBpdChcInN0YWNrIGtleSBtYXRjaGVzICdjbG9qdXJlJ1wiLCAoKSA9PiB7XG4gICAgZXhwZWN0KGEuc3RhY2spLnRvQmUoXCJjbG9qdXJlXCIpO1xuICB9KTtcblxuICBmb3IgKGNvbnN0IG0gb2YgbWV0aG9kcykge1xuICAgIGl0KGAke219KCkgdGhyb3dzIE5vdEltcGxlbWVudGVkRXJyb3IgcG9pbnRpbmcgdG8gZG9jcy9hZGFwdGVycy9jbG9qdXJlLm1kYCwgKCkgPT4ge1xuICAgICAgZXhwZWN0KCgpID0+IChhIGFzIGFueSlbbV0oY29uZmlnKSkudG9UaHJvdyhOb3RJbXBsZW1lbnRlZEVycm9yKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIChhIGFzIGFueSlbbV0oY29uZmlnKTtcbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgICBleHBlY3QoZS5tZXNzYWdlKS50b01hdGNoKC9kb2NzXFwvYWRhcHRlcnNcXC9jbG9qdXJlXFwubWQvKTtcbiAgICAgICAgZXhwZWN0KGUubWVzc2FnZSkudG9NYXRjaCgvUnVudGltZUFkYXB0ZXIvKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufSk7XG4iXX0=