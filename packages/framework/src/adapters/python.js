"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonAdapter = void 0;
const errors_1 = require("./errors");
const DEFAULT_TEST_ROOT_BY_SHAPE = {
    lambda: "test/unit/src/python",
    wheel: "tests",
};
function resolveTestRoot(config) {
    if (config.test_root && config.test_root.trim() !== "")
        return config.test_root;
    const fallback = DEFAULT_TEST_ROOT_BY_SHAPE[config.service_shape];
    if (!fallback) {
        // The schema enum (lambda | wheel | binary) prevents this for non-binary;
        // binary is reserved for Go/Clojure and shouldn't reach PythonAdapter.
        throw new errors_1.AdapterConfigError(`python adapter cannot infer test_root from service_shape='${config.service_shape}'; declare test_root in .dx.yaml`);
    }
    return fallback;
}
class PythonAdapter {
    stack = "python";
    lintCommand(_config) {
        return { cmd: "ruff", args: ["check", "."] };
    }
    unitTestCommand(config) {
        return {
            cmd: "pytest",
            args: ["-x", "-q", "-m", "not pbt"],
            cwd: resolveTestRoot(config),
        };
    }
    pbtCommand(config) {
        return {
            cmd: "pytest",
            args: ["-x", "-q", "-m", "pbt"],
            cwd: resolveTestRoot(config),
        };
    }
    contractCommand(_config) {
        // Schemathesis is the platform default for OpenAPI-driven contract checks.
        // Per-project tweaks are expressed via custom_steps in .dx.yaml, not by
        // overriding this method.
        return {
            cmd: "schemathesis",
            args: ["run", "openapi.yaml", "--hypothesis-deadline=2000", "--checks=all"],
        };
    }
    packageCommand(config) {
        switch (config.service_shape) {
            case "lambda":
                // Bundle the CDK synth output. Honest about what it covers: this is
                // a packaging convenience for upload-artifact + attest-build-provenance
                // (single subject). Per-asset attestation (one subject per
                // cdk.out/asset.<hash>.zip) is the documented evolution path; CDK
                // deploys per-asset, not the tarball. Do NOT claim the tarball "is
                // what gets deployed".
                return {
                    cmd: "sh",
                    args: [
                        "-c",
                        "npx tsc && npx cdk synth --quiet && tar -czf service-package.tgz cdk.out/",
                    ],
                };
            case "wheel":
                return { cmd: "uv", args: ["build"] };
            case "binary":
                throw new errors_1.AdapterConfigError("python adapter does not support service_shape='binary' (binary is reserved for Go/Clojure adapters)");
            default:
                throw new errors_1.AdapterConfigError("cannot determine package shape; declare service_shape in .dx.yaml (lambda | wheel)");
        }
    }
}
exports.PythonAdapter = PythonAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHl0aG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHl0aG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQW1CQSxxQ0FBOEM7QUFFOUMsTUFBTSwwQkFBMEIsR0FBMkI7SUFDekQsTUFBTSxFQUFFLHNCQUFzQjtJQUM5QixLQUFLLEVBQUUsT0FBTztDQUNmLENBQUM7QUFFRixTQUFTLGVBQWUsQ0FBQyxNQUFnQjtJQUN2QyxJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1FBQUUsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2hGLE1BQU0sUUFBUSxHQUFHLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNsRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZCwwRUFBMEU7UUFDMUUsdUVBQXVFO1FBQ3ZFLE1BQU0sSUFBSSwyQkFBa0IsQ0FDMUIsNkRBQTZELE1BQU0sQ0FBQyxhQUFhLGtDQUFrQyxDQUNwSCxDQUFDO0lBQ0osQ0FBQztJQUNELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxNQUFhLGFBQWE7SUFDZixLQUFLLEdBQUcsUUFBaUIsQ0FBQztJQUVuQyxXQUFXLENBQUMsT0FBaUI7UUFDM0IsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELGVBQWUsQ0FBQyxNQUFnQjtRQUM5QixPQUFPO1lBQ0wsR0FBRyxFQUFFLFFBQVE7WUFDYixJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUM7WUFDbkMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxNQUFNLENBQUM7U0FDN0IsQ0FBQztJQUNKLENBQUM7SUFFRCxVQUFVLENBQUMsTUFBZ0I7UUFDekIsT0FBTztZQUNMLEdBQUcsRUFBRSxRQUFRO1lBQ2IsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQy9CLEdBQUcsRUFBRSxlQUFlLENBQUMsTUFBTSxDQUFDO1NBQzdCLENBQUM7SUFDSixDQUFDO0lBRUQsZUFBZSxDQUFDLE9BQWlCO1FBQy9CLDJFQUEyRTtRQUMzRSx3RUFBd0U7UUFDeEUsMEJBQTBCO1FBQzFCLE9BQU87WUFDTCxHQUFHLEVBQUUsY0FBYztZQUNuQixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLDRCQUE0QixFQUFFLGNBQWMsQ0FBQztTQUM1RSxDQUFDO0lBQ0osQ0FBQztJQUVELGNBQWMsQ0FBQyxNQUFnQjtRQUM3QixRQUFRLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM3QixLQUFLLFFBQVE7Z0JBQ1gsb0VBQW9FO2dCQUNwRSx3RUFBd0U7Z0JBQ3hFLDJEQUEyRDtnQkFDM0Qsa0VBQWtFO2dCQUNsRSxtRUFBbUU7Z0JBQ25FLHVCQUF1QjtnQkFDdkIsT0FBTztvQkFDTCxHQUFHLEVBQUUsSUFBSTtvQkFDVCxJQUFJLEVBQUU7d0JBQ0osSUFBSTt3QkFDSiwyRUFBMkU7cUJBQzVFO2lCQUNGLENBQUM7WUFDSixLQUFLLE9BQU87Z0JBQ1YsT0FBTyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUN4QyxLQUFLLFFBQVE7Z0JBQ1gsTUFBTSxJQUFJLDJCQUFrQixDQUMxQixxR0FBcUcsQ0FDdEcsQ0FBQztZQUNKO2dCQUNFLE1BQU0sSUFBSSwyQkFBa0IsQ0FDMUIsb0ZBQW9GLENBQ3JGLENBQUM7UUFDTixDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBN0RELHNDQTZEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHl0aG9uQWRhcHRlciDigJQgdGhlIHJlYWwgYWRhcHRlciBkb2dmb29kZWQgYWdhaW5zdCB0aGUgVHJhbnNhY3Rpb25pZnkgZm9yay5cbiAqXG4gKiBsaW50OiAgICAgcnVmZiBjaGVjayAuXG4gKiB1bml0OiAgICAgcHl0ZXN0IC14IC1xIC1tICdub3QgcGJ0JyAgIChjd2QgZnJvbSAuZHgueWFtbC50ZXN0X3Jvb3QpXG4gKiBwYnQ6ICAgICAgcHl0ZXN0IC14IC1xIC1tIHBidCAgICAgICAgICAoY3dkIGZyb20gLmR4LnlhbWwudGVzdF9yb290KVxuICogY29udHJhY3Q6IHNjaGVtYXRoZXNpcyBydW4gb3BlbmFwaS55YW1sIC0taHlwb3RoZXNpcy1kZWFkbGluZT0yMDAwXG4gKiBwYWNrYWdlOiAgc2VydmljZV9zaGFwZS1hd2FyZVxuICogICAgICAgICAgICAgLSBsYW1iZGEg4oaSIGNkayBzeW50aCArIHRhciBjZGsub3V0XG4gKiAgICAgICAgICAgICAtIHdoZWVsICDihpIgdXYgYnVpbGRcbiAqICAgICAgICAgICAgIC0gdW5zZXQgJiBhbWJpZ3VvdXMg4oaSIEFkYXB0ZXJDb25maWdFcnJvclxuICpcbiAqIHRlc3Rfcm9vdCBkZWZhdWx0cyBieSBzZXJ2aWNlX3NoYXBlOlxuICogICAtIGxhbWJkYSDihpIgJ3Rlc3QvdW5pdC9zcmMvcHl0aG9uJyAoVHJhbnNhY3Rpb25pZnktc3R5bGUpXG4gKiAgIC0gd2hlZWwgIOKGkiAndGVzdHMnICAgICAgICAgICAgICAgIChkaXN0cmlidXRhYmxlIFB5dGhvbilcbiAqIE92ZXJyaWRlIHZpYSAuZHgueWFtbC50ZXN0X3Jvb3Qgd2hlbiB0aGUgcHJvamVjdCBkZXZpYXRlcy5cbiAqL1xuaW1wb3J0IHR5cGUgeyBEeENvbmZpZyB9IGZyb20gXCIuLi90eXBlcy9keC1jb25maWdcIjtcbmltcG9ydCB0eXBlIHsgQWRhcHRlckNvbW1hbmQsIFJ1bnRpbWVBZGFwdGVyIH0gZnJvbSBcIi4vcnVudGltZS1hZGFwdGVyXCI7XG5pbXBvcnQgeyBBZGFwdGVyQ29uZmlnRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgREVGQVVMVF9URVNUX1JPT1RfQllfU0hBUEU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIGxhbWJkYTogXCJ0ZXN0L3VuaXQvc3JjL3B5dGhvblwiLFxuICB3aGVlbDogXCJ0ZXN0c1wiLFxufTtcblxuZnVuY3Rpb24gcmVzb2x2ZVRlc3RSb290KGNvbmZpZzogRHhDb25maWcpOiBzdHJpbmcge1xuICBpZiAoY29uZmlnLnRlc3Rfcm9vdCAmJiBjb25maWcudGVzdF9yb290LnRyaW0oKSAhPT0gXCJcIikgcmV0dXJuIGNvbmZpZy50ZXN0X3Jvb3Q7XG4gIGNvbnN0IGZhbGxiYWNrID0gREVGQVVMVF9URVNUX1JPT1RfQllfU0hBUEVbY29uZmlnLnNlcnZpY2Vfc2hhcGVdO1xuICBpZiAoIWZhbGxiYWNrKSB7XG4gICAgLy8gVGhlIHNjaGVtYSBlbnVtIChsYW1iZGEgfCB3aGVlbCB8IGJpbmFyeSkgcHJldmVudHMgdGhpcyBmb3Igbm9uLWJpbmFyeTtcbiAgICAvLyBiaW5hcnkgaXMgcmVzZXJ2ZWQgZm9yIEdvL0Nsb2p1cmUgYW5kIHNob3VsZG4ndCByZWFjaCBQeXRob25BZGFwdGVyLlxuICAgIHRocm93IG5ldyBBZGFwdGVyQ29uZmlnRXJyb3IoXG4gICAgICBgcHl0aG9uIGFkYXB0ZXIgY2Fubm90IGluZmVyIHRlc3Rfcm9vdCBmcm9tIHNlcnZpY2Vfc2hhcGU9JyR7Y29uZmlnLnNlcnZpY2Vfc2hhcGV9JzsgZGVjbGFyZSB0ZXN0X3Jvb3QgaW4gLmR4LnlhbWxgLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGZhbGxiYWNrO1xufVxuXG5leHBvcnQgY2xhc3MgUHl0aG9uQWRhcHRlciBpbXBsZW1lbnRzIFJ1bnRpbWVBZGFwdGVyIHtcbiAgcmVhZG9ubHkgc3RhY2sgPSBcInB5dGhvblwiIGFzIGNvbnN0O1xuXG4gIGxpbnRDb21tYW5kKF9jb25maWc6IER4Q29uZmlnKTogQWRhcHRlckNvbW1hbmQge1xuICAgIHJldHVybiB7IGNtZDogXCJydWZmXCIsIGFyZ3M6IFtcImNoZWNrXCIsIFwiLlwiXSB9O1xuICB9XG5cbiAgdW5pdFRlc3RDb21tYW5kKGNvbmZpZzogRHhDb25maWcpOiBBZGFwdGVyQ29tbWFuZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNtZDogXCJweXRlc3RcIixcbiAgICAgIGFyZ3M6IFtcIi14XCIsIFwiLXFcIiwgXCItbVwiLCBcIm5vdCBwYnRcIl0sXG4gICAgICBjd2Q6IHJlc29sdmVUZXN0Um9vdChjb25maWcpLFxuICAgIH07XG4gIH1cblxuICBwYnRDb21tYW5kKGNvbmZpZzogRHhDb25maWcpOiBBZGFwdGVyQ29tbWFuZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNtZDogXCJweXRlc3RcIixcbiAgICAgIGFyZ3M6IFtcIi14XCIsIFwiLXFcIiwgXCItbVwiLCBcInBidFwiXSxcbiAgICAgIGN3ZDogcmVzb2x2ZVRlc3RSb290KGNvbmZpZyksXG4gICAgfTtcbiAgfVxuXG4gIGNvbnRyYWN0Q29tbWFuZChfY29uZmlnOiBEeENvbmZpZyk6IEFkYXB0ZXJDb21tYW5kIHtcbiAgICAvLyBTY2hlbWF0aGVzaXMgaXMgdGhlIHBsYXRmb3JtIGRlZmF1bHQgZm9yIE9wZW5BUEktZHJpdmVuIGNvbnRyYWN0IGNoZWNrcy5cbiAgICAvLyBQZXItcHJvamVjdCB0d2Vha3MgYXJlIGV4cHJlc3NlZCB2aWEgY3VzdG9tX3N0ZXBzIGluIC5keC55YW1sLCBub3QgYnlcbiAgICAvLyBvdmVycmlkaW5nIHRoaXMgbWV0aG9kLlxuICAgIHJldHVybiB7XG4gICAgICBjbWQ6IFwic2NoZW1hdGhlc2lzXCIsXG4gICAgICBhcmdzOiBbXCJydW5cIiwgXCJvcGVuYXBpLnlhbWxcIiwgXCItLWh5cG90aGVzaXMtZGVhZGxpbmU9MjAwMFwiLCBcIi0tY2hlY2tzPWFsbFwiXSxcbiAgICB9O1xuICB9XG5cbiAgcGFja2FnZUNvbW1hbmQoY29uZmlnOiBEeENvbmZpZyk6IEFkYXB0ZXJDb21tYW5kIHtcbiAgICBzd2l0Y2ggKGNvbmZpZy5zZXJ2aWNlX3NoYXBlKSB7XG4gICAgICBjYXNlIFwibGFtYmRhXCI6XG4gICAgICAgIC8vIEJ1bmRsZSB0aGUgQ0RLIHN5bnRoIG91dHB1dC4gSG9uZXN0IGFib3V0IHdoYXQgaXQgY292ZXJzOiB0aGlzIGlzXG4gICAgICAgIC8vIGEgcGFja2FnaW5nIGNvbnZlbmllbmNlIGZvciB1cGxvYWQtYXJ0aWZhY3QgKyBhdHRlc3QtYnVpbGQtcHJvdmVuYW5jZVxuICAgICAgICAvLyAoc2luZ2xlIHN1YmplY3QpLiBQZXItYXNzZXQgYXR0ZXN0YXRpb24gKG9uZSBzdWJqZWN0IHBlclxuICAgICAgICAvLyBjZGsub3V0L2Fzc2V0LjxoYXNoPi56aXApIGlzIHRoZSBkb2N1bWVudGVkIGV2b2x1dGlvbiBwYXRoOyBDREtcbiAgICAgICAgLy8gZGVwbG95cyBwZXItYXNzZXQsIG5vdCB0aGUgdGFyYmFsbC4gRG8gTk9UIGNsYWltIHRoZSB0YXJiYWxsIFwiaXNcbiAgICAgICAgLy8gd2hhdCBnZXRzIGRlcGxveWVkXCIuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY21kOiBcInNoXCIsXG4gICAgICAgICAgYXJnczogW1xuICAgICAgICAgICAgXCItY1wiLFxuICAgICAgICAgICAgXCJucHggdHNjICYmIG5weCBjZGsgc3ludGggLS1xdWlldCAmJiB0YXIgLWN6ZiBzZXJ2aWNlLXBhY2thZ2UudGd6IGNkay5vdXQvXCIsXG4gICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgXCJ3aGVlbFwiOlxuICAgICAgICByZXR1cm4geyBjbWQ6IFwidXZcIiwgYXJnczogW1wiYnVpbGRcIl0gfTtcbiAgICAgIGNhc2UgXCJiaW5hcnlcIjpcbiAgICAgICAgdGhyb3cgbmV3IEFkYXB0ZXJDb25maWdFcnJvcihcbiAgICAgICAgICBcInB5dGhvbiBhZGFwdGVyIGRvZXMgbm90IHN1cHBvcnQgc2VydmljZV9zaGFwZT0nYmluYXJ5JyAoYmluYXJ5IGlzIHJlc2VydmVkIGZvciBHby9DbG9qdXJlIGFkYXB0ZXJzKVwiLFxuICAgICAgICApO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEFkYXB0ZXJDb25maWdFcnJvcihcbiAgICAgICAgICBcImNhbm5vdCBkZXRlcm1pbmUgcGFja2FnZSBzaGFwZTsgZGVjbGFyZSBzZXJ2aWNlX3NoYXBlIGluIC5keC55YW1sIChsYW1iZGEgfCB3aGVlbClcIixcbiAgICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==