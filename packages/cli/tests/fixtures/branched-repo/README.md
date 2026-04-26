# branched-repo fixture

Materialised on demand by `bootstrap.sh` (idempotent). Used by
`dx pr --dry-run --json` validation in GP-002b. The `.git/` directory
is NOT checked in (would conflict with the parent repo's git tracking).
