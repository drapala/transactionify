/**
 * Typed import of the codegened CHECK_MANIFEST. Centralises the
 * `import manifest from "../../generated/check-manifest.json"` cast
 * so the 5 step builders share the same typed surface (and the cast
 * lives in ONE place, not five).
 */
import rawManifest from "../../generated/check-manifest.json";
import type { CheckManifest } from "../../generated/check-manifest.types";

export const manifest = rawManifest as unknown as CheckManifest;
