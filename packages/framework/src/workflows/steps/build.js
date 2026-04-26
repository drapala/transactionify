"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_PACKAGE_ARTIFACT_NAME = exports.buildSteps = void 0;
/**
 * Build job's command + artifact upload. The artifact name is fixed
 * ('service-package') so the attest job can reference it without a
 * cross-job needs-output dance.
 */
function buildSteps(adapter, config) {
    const pkg = adapter.packageCommand(config);
    const cmd = pkg.cwd
        ? `( cd ${pkg.cwd} && ${pkg.cmd} ${pkg.args.join(" ")} )`
        : `${pkg.cmd} ${pkg.args.join(" ")}`;
    return [
        { name: "package (RuntimeAdapter.packageCommand)", run: cmd },
        {
            name: "upload service-package artifact",
            uses: "actions/upload-artifact@v4",
            with: {
                name: "service-package",
                path: config.service_shape === "lambda" ? "service-package.tgz" : "dist/*",
                "if-no-files-found": "error",
            },
        },
    ];
}
exports.buildSteps = buildSteps;
exports.SERVICE_PACKAGE_ARTIFACT_NAME = "service-package";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJidWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFJQTs7OztHQUlHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLE9BQXVCLEVBQUUsTUFBZ0I7SUFDbEUsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRztRQUNqQixDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUk7UUFDekQsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3ZDLE9BQU87UUFDTCxFQUFFLElBQUksRUFBRSx5Q0FBeUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO1FBQzdEO1lBQ0UsSUFBSSxFQUFFLGlDQUFpQztZQUN2QyxJQUFJLEVBQUUsNEJBQTRCO1lBQ2xDLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUUsaUJBQWlCO2dCQUN2QixJQUFJLEVBQUUsTUFBTSxDQUFDLGFBQWEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxRQUFRO2dCQUMxRSxtQkFBbUIsRUFBRSxPQUFPO2FBQzdCO1NBQ0Y7S0FDRixDQUFDO0FBQ0osQ0FBQztBQWpCRCxnQ0FpQkM7QUFFWSxRQUFBLDZCQUE2QixHQUFHLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBXb3JrZmxvd1N0ZXAgfSBmcm9tIFwiLi4vcmVuZGVyZXJcIjtcbmltcG9ydCB0eXBlIHsgUnVudGltZUFkYXB0ZXIgfSBmcm9tIFwiLi4vLi4vYWRhcHRlcnMvcnVudGltZS1hZGFwdGVyXCI7XG5pbXBvcnQgdHlwZSB7IER4Q29uZmlnIH0gZnJvbSBcIi4uLy4uL3R5cGVzL2R4LWNvbmZpZ1wiO1xuXG4vKipcbiAqIEJ1aWxkIGpvYidzIGNvbW1hbmQgKyBhcnRpZmFjdCB1cGxvYWQuIFRoZSBhcnRpZmFjdCBuYW1lIGlzIGZpeGVkXG4gKiAoJ3NlcnZpY2UtcGFja2FnZScpIHNvIHRoZSBhdHRlc3Qgam9iIGNhbiByZWZlcmVuY2UgaXQgd2l0aG91dCBhXG4gKiBjcm9zcy1qb2IgbmVlZHMtb3V0cHV0IGRhbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTdGVwcyhhZGFwdGVyOiBSdW50aW1lQWRhcHRlciwgY29uZmlnOiBEeENvbmZpZyk6IFdvcmtmbG93U3RlcFtdIHtcbiAgY29uc3QgcGtnID0gYWRhcHRlci5wYWNrYWdlQ29tbWFuZChjb25maWcpO1xuICBjb25zdCBjbWQgPSBwa2cuY3dkXG4gICAgPyBgKCBjZCAke3BrZy5jd2R9ICYmICR7cGtnLmNtZH0gJHtwa2cuYXJncy5qb2luKFwiIFwiKX0gKWBcbiAgICA6IGAke3BrZy5jbWR9ICR7cGtnLmFyZ3Muam9pbihcIiBcIil9YDtcbiAgcmV0dXJuIFtcbiAgICB7IG5hbWU6IFwicGFja2FnZSAoUnVudGltZUFkYXB0ZXIucGFja2FnZUNvbW1hbmQpXCIsIHJ1bjogY21kIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJ1cGxvYWQgc2VydmljZS1wYWNrYWdlIGFydGlmYWN0XCIsXG4gICAgICB1c2VzOiBcImFjdGlvbnMvdXBsb2FkLWFydGlmYWN0QHY0XCIsXG4gICAgICB3aXRoOiB7XG4gICAgICAgIG5hbWU6IFwic2VydmljZS1wYWNrYWdlXCIsXG4gICAgICAgIHBhdGg6IGNvbmZpZy5zZXJ2aWNlX3NoYXBlID09PSBcImxhbWJkYVwiID8gXCJzZXJ2aWNlLXBhY2thZ2UudGd6XCIgOiBcImRpc3QvKlwiLFxuICAgICAgICBcImlmLW5vLWZpbGVzLWZvdW5kXCI6IFwiZXJyb3JcIixcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbn1cblxuZXhwb3J0IGNvbnN0IFNFUlZJQ0VfUEFDS0FHRV9BUlRJRkFDVF9OQU1FID0gXCJzZXJ2aWNlLXBhY2thZ2VcIjtcbiJdfQ==