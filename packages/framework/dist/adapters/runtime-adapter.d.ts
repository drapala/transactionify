/**
 * RuntimeAdapter — the contract every stack adapter implements.
 *
 * Returning structured commands {cmd, args, cwd?} (instead of raw shell
 * strings) avoids quoting bugs, makes commands testable in isolation, and
 * lets `dx check` and the workflow renderer build invocations without
 * re-parsing.
 *
 * Five methods, one per CI stage the platform recognises:
 *   - lintCommand     (lint stage)
 *   - unitTestCommand (unit stage)
 *   - pbtCommand      (PBT stage — DISTINCT from unit, per PDF)
 *   - contractCommand (API contract stage)
 *   - packageCommand  (build / packaging stage)
 *
 * The PDF lists Unit Tests, PBT, and API Contract as three separate
 * deliverables, so pbtCommand is its own method, not folded into
 * unitTestCommand.
 */
import type { DxConfig } from "../types/dx-config";
export interface AdapterCommand {
    cmd: string;
    args: string[];
    /** Working directory relative to the repo root. Optional. */
    cwd?: string;
}
export interface RuntimeAdapter {
    /** Stack name (must match `DxConfig.stack`). */
    readonly stack: DxConfig["stack"];
    lintCommand(config: DxConfig): AdapterCommand;
    unitTestCommand(config: DxConfig): AdapterCommand;
    pbtCommand(config: DxConfig): AdapterCommand;
    contractCommand(config: DxConfig): AdapterCommand;
    packageCommand(config: DxConfig): AdapterCommand;
}
