"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Drift detector. Imports the codegen module directly, regenerates the
 * type strings in-memory, and compares against on-disk src/types/*.ts.
 * Any divergence fails the test with a clear "run pnpm codegen" message.
 */
const vitest_1 = require("vitest");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const codegen_types_1 = require("../scripts/codegen-types");
(0, vitest_1.describe)("type drift vs schema", () => {
    (0, vitest_1.it)("src/types/dora-event.ts matches codegen output (run `pnpm codegen` if this fails)", async () => {
        const { dora } = await (0, codegen_types_1.generateAll)();
        const onDisk = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(codegen_types_1.OUT_DIR, "dora-event.ts"), "utf8");
        (0, vitest_1.expect)(onDisk).toBe(dora);
    }, 30000);
    (0, vitest_1.it)("src/types/dx-config.ts matches codegen output (run `pnpm codegen` if this fails)", async () => {
        const { dxConfig } = await (0, codegen_types_1.generateAll)();
        const onDisk = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(codegen_types_1.OUT_DIR, "dx-config.ts"), "utf8");
        (0, vitest_1.expect)(onDisk).toBe(dxConfig);
    }, 30000);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMtbWF0Y2gtc2NoZW1hLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy1tYXRjaC1zY2hlbWEudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7O0dBSUc7QUFDSCxtQ0FBOEM7QUFDOUMscUNBQXVDO0FBQ3ZDLHlDQUFvQztBQUNwQyw0REFBZ0U7QUFFaEUsSUFBQSxpQkFBUSxFQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtJQUNwQyxJQUFBLFdBQUUsRUFBQyxtRkFBbUYsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNqRyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFBLDJCQUFXLEdBQUUsQ0FBQztRQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHNCQUFZLEVBQUMsSUFBQSxtQkFBTyxFQUFDLHVCQUFPLEVBQUUsZUFBZSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkUsSUFBQSxlQUFNLEVBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUMsRUFBRSxLQUFNLENBQUMsQ0FBQztJQUVYLElBQUEsV0FBRSxFQUFDLGtGQUFrRixFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ2hHLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUEsMkJBQVcsR0FBRSxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUEsc0JBQVksRUFBQyxJQUFBLG1CQUFPLEVBQUMsdUJBQU8sRUFBRSxjQUFjLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RSxJQUFBLGVBQU0sRUFBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsQ0FBQyxFQUFFLEtBQU0sQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIERyaWZ0IGRldGVjdG9yLiBJbXBvcnRzIHRoZSBjb2RlZ2VuIG1vZHVsZSBkaXJlY3RseSwgcmVnZW5lcmF0ZXMgdGhlXG4gKiB0eXBlIHN0cmluZ3MgaW4tbWVtb3J5LCBhbmQgY29tcGFyZXMgYWdhaW5zdCBvbi1kaXNrIHNyYy90eXBlcy8qLnRzLlxuICogQW55IGRpdmVyZ2VuY2UgZmFpbHMgdGhlIHRlc3Qgd2l0aCBhIGNsZWFyIFwicnVuIHBucG0gY29kZWdlblwiIG1lc3NhZ2UuXG4gKi9cbmltcG9ydCB7IGRlc2NyaWJlLCBpdCwgZXhwZWN0IH0gZnJvbSBcInZpdGVzdFwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSBcIm5vZGU6ZnNcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZUFsbCwgT1VUX0RJUiB9IGZyb20gXCIuLi9zY3JpcHRzL2NvZGVnZW4tdHlwZXNcIjtcblxuZGVzY3JpYmUoXCJ0eXBlIGRyaWZ0IHZzIHNjaGVtYVwiLCAoKSA9PiB7XG4gIGl0KFwic3JjL3R5cGVzL2RvcmEtZXZlbnQudHMgbWF0Y2hlcyBjb2RlZ2VuIG91dHB1dCAocnVuIGBwbnBtIGNvZGVnZW5gIGlmIHRoaXMgZmFpbHMpXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRvcmEgfSA9IGF3YWl0IGdlbmVyYXRlQWxsKCk7XG4gICAgY29uc3Qgb25EaXNrID0gcmVhZEZpbGVTeW5jKHJlc29sdmUoT1VUX0RJUiwgXCJkb3JhLWV2ZW50LnRzXCIpLCBcInV0ZjhcIik7XG4gICAgZXhwZWN0KG9uRGlzaykudG9CZShkb3JhKTtcbiAgfSwgMzBfMDAwKTtcblxuICBpdChcInNyYy90eXBlcy9keC1jb25maWcudHMgbWF0Y2hlcyBjb2RlZ2VuIG91dHB1dCAocnVuIGBwbnBtIGNvZGVnZW5gIGlmIHRoaXMgZmFpbHMpXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGR4Q29uZmlnIH0gPSBhd2FpdCBnZW5lcmF0ZUFsbCgpO1xuICAgIGNvbnN0IG9uRGlzayA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKE9VVF9ESVIsIFwiZHgtY29uZmlnLnRzXCIpLCBcInV0ZjhcIik7XG4gICAgZXhwZWN0KG9uRGlzaykudG9CZShkeENvbmZpZyk7XG4gIH0sIDMwXzAwMCk7XG59KTtcbiJdfQ==