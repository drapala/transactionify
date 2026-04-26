"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinArgs = exports.shellQuote = void 0;
/**
 * Shell-quote helper for `run:` strings.
 *
 * CHECK_MANIFEST holds args as a JSON array: `["-x", "-q", "-m", "not pbt"]`.
 * When the framework renders these into a workflow's `run:` (a single shell
 * string), args containing spaces or special chars MUST be quoted — otherwise
 * pytest sees three separate args (`-m`, `not`, `pbt`) and fails with
 * "file or directory not found: pbt".
 *
 * Surfaced when PR #1's unit-tests job ran the rendered command and pytest
 * mis-parsed the unquoted marker. Local subprocess.run() does not have this
 * issue because it passes the array directly to execve(); only the shell
 * stringification path needs quoting.
 */
const SAFE = /^[A-Za-z0-9_\-./=:@%+,]+$/;
function shellQuote(arg) {
    if (SAFE.test(arg))
        return arg;
    // Wrap in single quotes; escape any embedded single-quote.
    return "'" + arg.replace(/'/g, "'\\''") + "'";
}
exports.shellQuote = shellQuote;
function joinArgs(cmd, args) {
    return [cmd, ...args.map(shellQuote)].join(" ");
}
exports.joinArgs = joinArgs;
