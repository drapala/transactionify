import type { WorkflowStep } from "../renderer";
/**
 * Attestation job's steps. Subject-path resolves to the artifact the
 * build job uploaded (downloaded into ./artifact/ first). Without a
 * resolvable subject-path, attest-build-provenance fails at runtime
 * with 'subject-path: file not found' — that earlier-draft footgun is
 * exactly what the test_integration_build_job.test.ts exists to prevent.
 */
export declare function attestationSteps(): WorkflowStep[];
