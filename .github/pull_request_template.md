## Work ID

<!-- Format: GP-NNN or LL-NNN. The PR title MUST start with `<work-id>: ` (e.g. `GP-123: feat add validator`). The pre-push hook + CI work-id-pr-title gate enforce this. -->

## Summary

<!-- 1-3 bullets. The "why" matters more than the "what". -->

-

## Test plan

- [ ]

## Audit-trail checklist

- [ ] Work ID present in branch + commits + this title (3-leg convention).
- [ ] No new secrets in code (use AWS Secrets Manager + IAM).
- [ ] If schema changed: shared-schemas bumped + framework codegen rerun.
- [ ] If CHECK_MANIFEST changed: `python -m dx.checks.manifest_codegen` rerun + diff committed.
