"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const typescript_1 = require("../../src/adapters/typescript");
const errors_1 = require("../../src/adapters/errors");
const config = {
    project: "x",
    stack: "typescript",
    service_shape: "typescript" === "typescript" ? "wheel" : "binary",
};
(0, vitest_1.describe)("TypescriptAdapter (stub)", () => {
    const a = new typescript_1.TypescriptAdapter();
    const methods = [
        "lintCommand",
        "unitTestCommand",
        "pbtCommand",
        "contractCommand",
        "packageCommand",
    ];
    (0, vitest_1.it)("stack key matches 'typescript'", () => {
        (0, vitest_1.expect)(a.stack).toBe("typescript");
    });
    for (const m of methods) {
        (0, vitest_1.it)(`${m}() throws NotImplementedError pointing to docs/adapters/typescript.md`, () => {
            (0, vitest_1.expect)(() => a[m](config)).toThrow(errors_1.NotImplementedError);
            try {
                a[m](config);
            }
            catch (e) {
                (0, vitest_1.expect)(e.message).toMatch(/docs\/adapters\/typescript\.md/);
                (0, vitest_1.expect)(e.message).toMatch(/RuntimeAdapter/);
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC1zdHViLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlc2NyaXB0LXN0dWIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4QztBQUM5Qyw4REFBa0U7QUFDbEUsc0RBQWdFO0FBR2hFLE1BQU0sTUFBTSxHQUFhO0lBQ3ZCLE9BQU8sRUFBRSxHQUFHO0lBQ1osS0FBSyxFQUFFLFlBQVk7SUFDbkIsYUFBYSxFQUFFLFlBQVksS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBZTtDQUN6RSxDQUFDO0FBRUYsSUFBQSxpQkFBUSxFQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtJQUN4QyxNQUFNLENBQUMsR0FBRyxJQUFJLDhCQUFpQixFQUFFLENBQUM7SUFDbEMsTUFBTSxPQUFPLEdBQUc7UUFDZCxhQUFhO1FBQ2IsaUJBQWlCO1FBQ2pCLFlBQVk7UUFDWixpQkFBaUI7UUFDakIsZ0JBQWdCO0tBQ1IsQ0FBQztJQUVYLElBQUEsV0FBRSxFQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUN4QyxJQUFBLGVBQU0sRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN4QixJQUFBLFdBQUUsRUFBQyxHQUFHLENBQUMsdUVBQXVFLEVBQUUsR0FBRyxFQUFFO1lBQ25GLElBQUEsZUFBTSxFQUFDLEdBQUcsRUFBRSxDQUFFLENBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBbUIsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQztnQkFDRixDQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7Z0JBQ2hCLElBQUEsZUFBTSxFQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztnQkFDNUQsSUFBQSxlQUFNLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzlDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlc2NyaWJlLCBpdCwgZXhwZWN0IH0gZnJvbSBcInZpdGVzdFwiO1xuaW1wb3J0IHsgVHlwZXNjcmlwdEFkYXB0ZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2FkYXB0ZXJzL3R5cGVzY3JpcHRcIjtcbmltcG9ydCB7IE5vdEltcGxlbWVudGVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vc3JjL2FkYXB0ZXJzL2Vycm9yc1wiO1xuaW1wb3J0IHR5cGUgeyBEeENvbmZpZyB9IGZyb20gXCIuLi8uLi9zcmMvdHlwZXMvZHgtY29uZmlnXCI7XG5cbmNvbnN0IGNvbmZpZzogRHhDb25maWcgPSB7XG4gIHByb2plY3Q6IFwieFwiLFxuICBzdGFjazogXCJ0eXBlc2NyaXB0XCIsXG4gIHNlcnZpY2Vfc2hhcGU6IFwidHlwZXNjcmlwdFwiID09PSBcInR5cGVzY3JpcHRcIiA/IFwid2hlZWxcIiA6IFwiYmluYXJ5XCIgYXMgYW55LFxufTtcblxuZGVzY3JpYmUoXCJUeXBlc2NyaXB0QWRhcHRlciAoc3R1YilcIiwgKCkgPT4ge1xuICBjb25zdCBhID0gbmV3IFR5cGVzY3JpcHRBZGFwdGVyKCk7XG4gIGNvbnN0IG1ldGhvZHMgPSBbXG4gICAgXCJsaW50Q29tbWFuZFwiLFxuICAgIFwidW5pdFRlc3RDb21tYW5kXCIsXG4gICAgXCJwYnRDb21tYW5kXCIsXG4gICAgXCJjb250cmFjdENvbW1hbmRcIixcbiAgICBcInBhY2thZ2VDb21tYW5kXCIsXG4gIF0gYXMgY29uc3Q7XG5cbiAgaXQoXCJzdGFjayBrZXkgbWF0Y2hlcyAndHlwZXNjcmlwdCdcIiwgKCkgPT4ge1xuICAgIGV4cGVjdChhLnN0YWNrKS50b0JlKFwidHlwZXNjcmlwdFwiKTtcbiAgfSk7XG5cbiAgZm9yIChjb25zdCBtIG9mIG1ldGhvZHMpIHtcbiAgICBpdChgJHttfSgpIHRocm93cyBOb3RJbXBsZW1lbnRlZEVycm9yIHBvaW50aW5nIHRvIGRvY3MvYWRhcHRlcnMvdHlwZXNjcmlwdC5tZGAsICgpID0+IHtcbiAgICAgIGV4cGVjdCgoKSA9PiAoYSBhcyBhbnkpW21dKGNvbmZpZykpLnRvVGhyb3coTm90SW1wbGVtZW50ZWRFcnJvcik7XG4gICAgICB0cnkge1xuICAgICAgICAoYSBhcyBhbnkpW21dKGNvbmZpZyk7XG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgZXhwZWN0KGUubWVzc2FnZSkudG9NYXRjaCgvZG9jc1xcL2FkYXB0ZXJzXFwvdHlwZXNjcmlwdFxcLm1kLyk7XG4gICAgICAgIGV4cGVjdChlLm1lc3NhZ2UpLnRvTWF0Y2goL1J1bnRpbWVBZGFwdGVyLyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn0pO1xuIl19