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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX3NoZWxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX3NoZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxNQUFNLElBQUksR0FBRywyQkFBMkIsQ0FBQztBQUV6QyxTQUFnQixVQUFVLENBQUMsR0FBVztJQUNwQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTyxHQUFHLENBQUM7SUFDL0IsMkRBQTJEO0lBQzNELE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNoRCxDQUFDO0FBSkQsZ0NBSUM7QUFFRCxTQUFnQixRQUFRLENBQUMsR0FBVyxFQUFFLElBQWM7SUFDbEQsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUZELDRCQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTaGVsbC1xdW90ZSBoZWxwZXIgZm9yIGBydW46YCBzdHJpbmdzLlxuICpcbiAqIENIRUNLX01BTklGRVNUIGhvbGRzIGFyZ3MgYXMgYSBKU09OIGFycmF5OiBgW1wiLXhcIiwgXCItcVwiLCBcIi1tXCIsIFwibm90IHBidFwiXWAuXG4gKiBXaGVuIHRoZSBmcmFtZXdvcmsgcmVuZGVycyB0aGVzZSBpbnRvIGEgd29ya2Zsb3cncyBgcnVuOmAgKGEgc2luZ2xlIHNoZWxsXG4gKiBzdHJpbmcpLCBhcmdzIGNvbnRhaW5pbmcgc3BhY2VzIG9yIHNwZWNpYWwgY2hhcnMgTVVTVCBiZSBxdW90ZWQg4oCUIG90aGVyd2lzZVxuICogcHl0ZXN0IHNlZXMgdGhyZWUgc2VwYXJhdGUgYXJncyAoYC1tYCwgYG5vdGAsIGBwYnRgKSBhbmQgZmFpbHMgd2l0aFxuICogXCJmaWxlIG9yIGRpcmVjdG9yeSBub3QgZm91bmQ6IHBidFwiLlxuICpcbiAqIFN1cmZhY2VkIHdoZW4gUFIgIzEncyB1bml0LXRlc3RzIGpvYiByYW4gdGhlIHJlbmRlcmVkIGNvbW1hbmQgYW5kIHB5dGVzdFxuICogbWlzLXBhcnNlZCB0aGUgdW5xdW90ZWQgbWFya2VyLiBMb2NhbCBzdWJwcm9jZXNzLnJ1bigpIGRvZXMgbm90IGhhdmUgdGhpc1xuICogaXNzdWUgYmVjYXVzZSBpdCBwYXNzZXMgdGhlIGFycmF5IGRpcmVjdGx5IHRvIGV4ZWN2ZSgpOyBvbmx5IHRoZSBzaGVsbFxuICogc3RyaW5naWZpY2F0aW9uIHBhdGggbmVlZHMgcXVvdGluZy5cbiAqL1xuY29uc3QgU0FGRSA9IC9eW0EtWmEtejAtOV9cXC0uLz06QCUrLF0rJC87XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGVsbFF1b3RlKGFyZzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKFNBRkUudGVzdChhcmcpKSByZXR1cm4gYXJnO1xuICAvLyBXcmFwIGluIHNpbmdsZSBxdW90ZXM7IGVzY2FwZSBhbnkgZW1iZWRkZWQgc2luZ2xlLXF1b3RlLlxuICByZXR1cm4gXCInXCIgKyBhcmcucmVwbGFjZSgvJy9nLCBcIidcXFxcJydcIikgKyBcIidcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpvaW5BcmdzKGNtZDogc3RyaW5nLCBhcmdzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIHJldHVybiBbY21kLCAuLi5hcmdzLm1hcChzaGVsbFF1b3RlKV0uam9pbihcIiBcIik7XG59XG4iXX0=