"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
