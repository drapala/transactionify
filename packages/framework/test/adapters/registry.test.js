"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("../../src/adapters/registry");
const python_1 = require("../../src/adapters/python");
const go_1 = require("../../src/adapters/go");
const clojure_1 = require("../../src/adapters/clojure");
const typescript_1 = require("../../src/adapters/typescript");
const errors_1 = require("../../src/adapters/errors");
(0, vitest_1.describe)("adapter registry", () => {
    (0, vitest_1.it)("keys are EXACTLY the four PDF-named stacks (no missing, no extra)", () => {
        (0, vitest_1.expect)(Object.keys(registry_1.registry).sort()).toEqual(["clojure", "go", "python", "typescript"]);
    });
    (0, vitest_1.it)("resolve('python') returns a PythonAdapter", () => {
        (0, vitest_1.expect)((0, registry_1.resolve)("python")).toBeInstanceOf(python_1.PythonAdapter);
    });
    (0, vitest_1.it)("resolve('go') returns a GoAdapter (resolution succeeds; methods fail)", () => {
        (0, vitest_1.expect)((0, registry_1.resolve)("go")).toBeInstanceOf(go_1.GoAdapter);
    });
    (0, vitest_1.it)("resolve('clojure') returns a ClojureAdapter", () => {
        (0, vitest_1.expect)((0, registry_1.resolve)("clojure")).toBeInstanceOf(clojure_1.ClojureAdapter);
    });
    (0, vitest_1.it)("resolve('typescript') returns a TypescriptAdapter", () => {
        (0, vitest_1.expect)((0, registry_1.resolve)("typescript")).toBeInstanceOf(typescript_1.TypescriptAdapter);
    });
    (0, vitest_1.it)("resolve('rust') throws UnsupportedStackError with InnerSource hint", () => {
        (0, vitest_1.expect)(() => (0, registry_1.resolve)("rust")).toThrow(errors_1.UnsupportedStackError);
        try {
            (0, registry_1.resolve)("rust");
        }
        catch (e) {
            (0, vitest_1.expect)(e.message).toMatch(/add an adapter/i);
            (0, vitest_1.expect)(e.message).toMatch(/docs\/adapters\//);
        }
    });
    (0, vitest_1.it)("stub method calls (not registry resolution) throw NotImplementedError", () => {
        const go = (0, registry_1.resolve)("go");
        (0, vitest_1.expect)(() => go.lintCommand({ project: "x", stack: "go", service_shape: "binary" })).toThrow(errors_1.NotImplementedError);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlZ2lzdHJ5LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBOEM7QUFDOUMsMERBQWdFO0FBQ2hFLHNEQUEwRDtBQUMxRCw4Q0FBa0Q7QUFDbEQsd0RBQTREO0FBQzVELDhEQUFrRTtBQUNsRSxzREFBdUY7QUFFdkYsSUFBQSxpQkFBUSxFQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNoQyxJQUFBLFdBQUUsRUFBQyxtRUFBbUUsRUFBRSxHQUFHLEVBQUU7UUFDM0UsSUFBQSxlQUFNLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBUSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQzFGLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxXQUFFLEVBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO1FBQ25ELElBQUEsZUFBTSxFQUFDLElBQUEsa0JBQU8sRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxzQkFBYSxDQUFDLENBQUM7SUFDMUQsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLFdBQUUsRUFBQyx1RUFBdUUsRUFBRSxHQUFHLEVBQUU7UUFDL0UsSUFBQSxlQUFNLEVBQUMsSUFBQSxrQkFBTyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQVMsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxXQUFFLEVBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO1FBQ3JELElBQUEsZUFBTSxFQUFDLElBQUEsa0JBQU8sRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyx3QkFBYyxDQUFDLENBQUM7SUFDNUQsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLFdBQUUsRUFBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7UUFDM0QsSUFBQSxlQUFNLEVBQUMsSUFBQSxrQkFBTyxFQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLDhCQUFpQixDQUFDLENBQUM7SUFDbEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLFdBQUUsRUFBQyxvRUFBb0UsRUFBRSxHQUFHLEVBQUU7UUFDNUUsSUFBQSxlQUFNLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBQSxrQkFBTyxFQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLDhCQUFxQixDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDO1lBQ0gsSUFBQSxrQkFBTyxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFBQyxPQUFPLENBQU0sRUFBRSxDQUFDO1lBQ2hCLElBQUEsZUFBTSxFQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM3QyxJQUFBLGVBQU0sRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxXQUFFLEVBQUMsdUVBQXVFLEVBQUUsR0FBRyxFQUFFO1FBQy9FLE1BQU0sRUFBRSxHQUFHLElBQUEsa0JBQU8sRUFBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixJQUFBLGVBQU0sRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUMxRiw0QkFBbUIsQ0FDcEIsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZXNjcmliZSwgaXQsIGV4cGVjdCB9IGZyb20gXCJ2aXRlc3RcIjtcbmltcG9ydCB7IHJlZ2lzdHJ5LCByZXNvbHZlIH0gZnJvbSBcIi4uLy4uL3NyYy9hZGFwdGVycy9yZWdpc3RyeVwiO1xuaW1wb3J0IHsgUHl0aG9uQWRhcHRlciB9IGZyb20gXCIuLi8uLi9zcmMvYWRhcHRlcnMvcHl0aG9uXCI7XG5pbXBvcnQgeyBHb0FkYXB0ZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2FkYXB0ZXJzL2dvXCI7XG5pbXBvcnQgeyBDbG9qdXJlQWRhcHRlciB9IGZyb20gXCIuLi8uLi9zcmMvYWRhcHRlcnMvY2xvanVyZVwiO1xuaW1wb3J0IHsgVHlwZXNjcmlwdEFkYXB0ZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2FkYXB0ZXJzL3R5cGVzY3JpcHRcIjtcbmltcG9ydCB7IE5vdEltcGxlbWVudGVkRXJyb3IsIFVuc3VwcG9ydGVkU3RhY2tFcnJvciB9IGZyb20gXCIuLi8uLi9zcmMvYWRhcHRlcnMvZXJyb3JzXCI7XG5cbmRlc2NyaWJlKFwiYWRhcHRlciByZWdpc3RyeVwiLCAoKSA9PiB7XG4gIGl0KFwia2V5cyBhcmUgRVhBQ1RMWSB0aGUgZm91ciBQREYtbmFtZWQgc3RhY2tzIChubyBtaXNzaW5nLCBubyBleHRyYSlcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChPYmplY3Qua2V5cyhyZWdpc3RyeSkuc29ydCgpKS50b0VxdWFsKFtcImNsb2p1cmVcIiwgXCJnb1wiLCBcInB5dGhvblwiLCBcInR5cGVzY3JpcHRcIl0pO1xuICB9KTtcblxuICBpdChcInJlc29sdmUoJ3B5dGhvbicpIHJldHVybnMgYSBQeXRob25BZGFwdGVyXCIsICgpID0+IHtcbiAgICBleHBlY3QocmVzb2x2ZShcInB5dGhvblwiKSkudG9CZUluc3RhbmNlT2YoUHl0aG9uQWRhcHRlcik7XG4gIH0pO1xuXG4gIGl0KFwicmVzb2x2ZSgnZ28nKSByZXR1cm5zIGEgR29BZGFwdGVyIChyZXNvbHV0aW9uIHN1Y2NlZWRzOyBtZXRob2RzIGZhaWwpXCIsICgpID0+IHtcbiAgICBleHBlY3QocmVzb2x2ZShcImdvXCIpKS50b0JlSW5zdGFuY2VPZihHb0FkYXB0ZXIpO1xuICB9KTtcblxuICBpdChcInJlc29sdmUoJ2Nsb2p1cmUnKSByZXR1cm5zIGEgQ2xvanVyZUFkYXB0ZXJcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChyZXNvbHZlKFwiY2xvanVyZVwiKSkudG9CZUluc3RhbmNlT2YoQ2xvanVyZUFkYXB0ZXIpO1xuICB9KTtcblxuICBpdChcInJlc29sdmUoJ3R5cGVzY3JpcHQnKSByZXR1cm5zIGEgVHlwZXNjcmlwdEFkYXB0ZXJcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChyZXNvbHZlKFwidHlwZXNjcmlwdFwiKSkudG9CZUluc3RhbmNlT2YoVHlwZXNjcmlwdEFkYXB0ZXIpO1xuICB9KTtcblxuICBpdChcInJlc29sdmUoJ3J1c3QnKSB0aHJvd3MgVW5zdXBwb3J0ZWRTdGFja0Vycm9yIHdpdGggSW5uZXJTb3VyY2UgaGludFwiLCAoKSA9PiB7XG4gICAgZXhwZWN0KCgpID0+IHJlc29sdmUoXCJydXN0XCIpKS50b1Rocm93KFVuc3VwcG9ydGVkU3RhY2tFcnJvcik7XG4gICAgdHJ5IHtcbiAgICAgIHJlc29sdmUoXCJydXN0XCIpO1xuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgZXhwZWN0KGUubWVzc2FnZSkudG9NYXRjaCgvYWRkIGFuIGFkYXB0ZXIvaSk7XG4gICAgICBleHBlY3QoZS5tZXNzYWdlKS50b01hdGNoKC9kb2NzXFwvYWRhcHRlcnNcXC8vKTtcbiAgICB9XG4gIH0pO1xuXG4gIGl0KFwic3R1YiBtZXRob2QgY2FsbHMgKG5vdCByZWdpc3RyeSByZXNvbHV0aW9uKSB0aHJvdyBOb3RJbXBsZW1lbnRlZEVycm9yXCIsICgpID0+IHtcbiAgICBjb25zdCBnbyA9IHJlc29sdmUoXCJnb1wiKTtcbiAgICBleHBlY3QoKCkgPT4gZ28ubGludENvbW1hbmQoeyBwcm9qZWN0OiBcInhcIiwgc3RhY2s6IFwiZ29cIiwgc2VydmljZV9zaGFwZTogXCJiaW5hcnlcIiB9KSkudG9UaHJvdyhcbiAgICAgIE5vdEltcGxlbWVudGVkRXJyb3IsXG4gICAgKTtcbiAgfSk7XG59KTtcbiJdfQ==