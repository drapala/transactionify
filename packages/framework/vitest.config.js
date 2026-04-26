"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const node_path_1 = require("node:path");
// Set root to the repo root so positional file filters can be passed in their
// canonical "packages/framework/test/..." form (matches the way tickets and
// CI workflows reference paths). Include the framework's own tests only.
exports.default = (0, config_1.defineConfig)({
    root: (0, node_path_1.resolve)(__dirname, "..", ".."),
    test: {
        include: ["packages/framework/test/**/*.test.ts"],
        environment: "node",
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidml0ZXN0LmNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZpdGVzdC5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBNkM7QUFDN0MseUNBQW9DO0FBRXBDLDhFQUE4RTtBQUM5RSw0RUFBNEU7QUFDNUUseUVBQXlFO0FBQ3pFLGtCQUFlLElBQUEscUJBQVksRUFBQztJQUMxQixJQUFJLEVBQUUsSUFBQSxtQkFBTyxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3BDLElBQUksRUFBRTtRQUNKLE9BQU8sRUFBRSxDQUFDLHNDQUFzQyxDQUFDO1FBQ2pELFdBQVcsRUFBRSxNQUFNO0tBQ3BCO0NBQ0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5cbi8vIFNldCByb290IHRvIHRoZSByZXBvIHJvb3Qgc28gcG9zaXRpb25hbCBmaWxlIGZpbHRlcnMgY2FuIGJlIHBhc3NlZCBpbiB0aGVpclxuLy8gY2Fub25pY2FsIFwicGFja2FnZXMvZnJhbWV3b3JrL3Rlc3QvLi4uXCIgZm9ybSAobWF0Y2hlcyB0aGUgd2F5IHRpY2tldHMgYW5kXG4vLyBDSSB3b3JrZmxvd3MgcmVmZXJlbmNlIHBhdGhzKS4gSW5jbHVkZSB0aGUgZnJhbWV3b3JrJ3Mgb3duIHRlc3RzIG9ubHkuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiByZXNvbHZlKF9fZGlybmFtZSwgXCIuLlwiLCBcIi4uXCIpLFxuICB0ZXN0OiB7XG4gICAgaW5jbHVkZTogW1wicGFja2FnZXMvZnJhbWV3b3JrL3Rlc3QvKiovKi50ZXN0LnRzXCJdLFxuICAgIGVudmlyb25tZW50OiBcIm5vZGVcIixcbiAgfSxcbn0pO1xuIl19