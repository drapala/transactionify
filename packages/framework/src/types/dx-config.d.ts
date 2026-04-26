/**
 * AUTO-GENERATED FILE — DO NOT EDIT.
 *
 * Source: packages/shared-schemas/*.schema.json (single source of truth).
 * Regenerate: `pnpm --filter @golden-path/framework codegen`.
 */
export interface DxConfig {
    /**
     * Logical project name (matches Backstage catalog-info.metadata.name).
     */
    project: string;
    /**
     * RuntimeAdapter registry key. Python is real; others are stubs in the PoC.
     */
    stack: "python" | "go" | "clojure" | "typescript";
    /**
     * Packaging strategy hint for the RuntimeAdapter. lambda = AWS Lambda; wheel = distributable Python; binary = Go/Clojure native binary.
     */
    service_shape: "lambda" | "wheel" | "binary";
    /**
     * Optional. Where the project's pytest.ini lives (also the cwd dx check passes to pytest). Default by service_shape: lambda → 'test/unit/src/python', wheel → 'tests'. Required only when the project deviates.
     */
    test_root?: string;
    /**
     * Optional override of the default Work-ID regex. Defaults to the platform-wide '^(LL|GP)-[0-9]+$'.
     */
    work_id_pattern?: string;
    /**
     * Optional per-agent settings (e.g. amazon_q { app_id, comment_trigger }).
     */
    agents?: {
        [k: string]: unknown;
    };
    /**
     * Escape hatch — extra steps spliced into dx check / generated workflows.
     */
    custom_steps?: {
        name: string;
        run: string;
        stage?: "pre-lint" | "post-lint" | "post-unit" | "post-pbt" | "post-contract";
    }[];
}
