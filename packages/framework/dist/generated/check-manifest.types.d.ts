/**
 * AUTO-GENERATED. Hand-typed twin of `check-manifest.json` shape — kept
 * in sync with `packages/cli/src/dx/checks/manifest.py` (CheckManifest
 * TypedDict). Update both together; the GP-007 cross-import test
 * asserts the JSON consumed at runtime byte-for-byte matches the Python
 * source, which guarantees this interface stays in sync structurally.
 *
 * Why hand-typed instead of json-schema-to-typescript: the manifest is
 * a domain-specific shape (not a JSON Schema), and codegen-from-JSON
 * tools produce wider unions than the actual constraint set. Hand-
 * writing the interface keeps step builders strictly typed.
 */
export interface CommandCheck {
    name: string;
    cmd: string;
    args: string[];
    exit_codes_passing: number[];
}
export interface WorkIdCheck {
    name: "work_id";
    extract_pattern: string;
    branch_pattern: string;
    subject_pattern: string;
}
export interface CheckManifest {
    lint: CommandCheck;
    unit_tests: CommandCheck;
    pbt: CommandCheck;
    contract: CommandCheck;
    work_id: WorkIdCheck;
}
