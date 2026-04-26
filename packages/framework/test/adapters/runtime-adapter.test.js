"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)("RuntimeAdapter interface", () => {
    (0, vitest_1.it)("declares the five contract methods", () => {
        // Compile-time check: any object satisfying RuntimeAdapter must expose
        // exactly these five methods. expectTypeOf fails compilation if the
        // interface drifts.
        (0, vitest_1.expectTypeOf)().toHaveProperty("lintCommand");
        (0, vitest_1.expectTypeOf)().toHaveProperty("unitTestCommand");
        (0, vitest_1.expectTypeOf)().toHaveProperty("pbtCommand");
        (0, vitest_1.expectTypeOf)().toHaveProperty("contractCommand");
        (0, vitest_1.expectTypeOf)().toHaveProperty("packageCommand");
    });
    (0, vitest_1.it)("AdapterCommand has structured cmd/args (not raw shell)", () => {
        (0, vitest_1.expectTypeOf)().toHaveProperty("cmd").toEqualTypeOf();
        (0, vitest_1.expectTypeOf)().toHaveProperty("args").toEqualTypeOf();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS1hZGFwdGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJydW50aW1lLWFkYXB0ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFvRDtBQUdwRCxJQUFBLGlCQUFRLEVBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLElBQUEsV0FBRSxFQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtRQUM1Qyx1RUFBdUU7UUFDdkUsb0VBQW9FO1FBQ3BFLG9CQUFvQjtRQUNwQixJQUFBLHFCQUFZLEdBQWtCLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELElBQUEscUJBQVksR0FBa0IsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRSxJQUFBLHFCQUFZLEdBQWtCLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVELElBQUEscUJBQVksR0FBa0IsQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRSxJQUFBLHFCQUFZLEdBQWtCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDbEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLFdBQUUsRUFBQyx3REFBd0QsRUFBRSxHQUFHLEVBQUU7UUFDaEUsSUFBQSxxQkFBWSxHQUFrQixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQVUsQ0FBQztRQUM3RSxJQUFBLHFCQUFZLEdBQWtCLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsRUFBWSxDQUFDO0lBQ2xGLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZXNjcmliZSwgaXQsIGV4cGVjdFR5cGVPZiB9IGZyb20gXCJ2aXRlc3RcIjtcbmltcG9ydCB0eXBlIHsgUnVudGltZUFkYXB0ZXIsIEFkYXB0ZXJDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9hZGFwdGVycy9ydW50aW1lLWFkYXB0ZXJcIjtcblxuZGVzY3JpYmUoXCJSdW50aW1lQWRhcHRlciBpbnRlcmZhY2VcIiwgKCkgPT4ge1xuICBpdChcImRlY2xhcmVzIHRoZSBmaXZlIGNvbnRyYWN0IG1ldGhvZHNcIiwgKCkgPT4ge1xuICAgIC8vIENvbXBpbGUtdGltZSBjaGVjazogYW55IG9iamVjdCBzYXRpc2Z5aW5nIFJ1bnRpbWVBZGFwdGVyIG11c3QgZXhwb3NlXG4gICAgLy8gZXhhY3RseSB0aGVzZSBmaXZlIG1ldGhvZHMuIGV4cGVjdFR5cGVPZiBmYWlscyBjb21waWxhdGlvbiBpZiB0aGVcbiAgICAvLyBpbnRlcmZhY2UgZHJpZnRzLlxuICAgIGV4cGVjdFR5cGVPZjxSdW50aW1lQWRhcHRlcj4oKS50b0hhdmVQcm9wZXJ0eShcImxpbnRDb21tYW5kXCIpO1xuICAgIGV4cGVjdFR5cGVPZjxSdW50aW1lQWRhcHRlcj4oKS50b0hhdmVQcm9wZXJ0eShcInVuaXRUZXN0Q29tbWFuZFwiKTtcbiAgICBleHBlY3RUeXBlT2Y8UnVudGltZUFkYXB0ZXI+KCkudG9IYXZlUHJvcGVydHkoXCJwYnRDb21tYW5kXCIpO1xuICAgIGV4cGVjdFR5cGVPZjxSdW50aW1lQWRhcHRlcj4oKS50b0hhdmVQcm9wZXJ0eShcImNvbnRyYWN0Q29tbWFuZFwiKTtcbiAgICBleHBlY3RUeXBlT2Y8UnVudGltZUFkYXB0ZXI+KCkudG9IYXZlUHJvcGVydHkoXCJwYWNrYWdlQ29tbWFuZFwiKTtcbiAgfSk7XG5cbiAgaXQoXCJBZGFwdGVyQ29tbWFuZCBoYXMgc3RydWN0dXJlZCBjbWQvYXJncyAobm90IHJhdyBzaGVsbClcIiwgKCkgPT4ge1xuICAgIGV4cGVjdFR5cGVPZjxBZGFwdGVyQ29tbWFuZD4oKS50b0hhdmVQcm9wZXJ0eShcImNtZFwiKS50b0VxdWFsVHlwZU9mPHN0cmluZz4oKTtcbiAgICBleHBlY3RUeXBlT2Y8QWRhcHRlckNvbW1hbmQ+KCkudG9IYXZlUHJvcGVydHkoXCJhcmdzXCIpLnRvRXF1YWxUeXBlT2Y8c3RyaW5nW10+KCk7XG4gIH0pO1xufSk7XG4iXX0=