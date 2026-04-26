# Expected output snapshots

These files capture the canonical output of each demo beat. Use them as a
fallback narration source if the live run fails on stage. Diffs between live
and expected output are themselves a Staff signal — if the script started
failing, the platform broke; show the snapshot AND the live failure honestly.

| File | Capture command |
|---|---|
| `act1-init.json` | `dx init --force --json > scripts/demo/expected-output/act1-init.json` |
| `act1-governance.json` | `dx governance apply --repo $REPO --json > scripts/demo/expected-output/act1-governance.json` |
| `act2-pr-dry-run.json` | `dx pr --dry-run --json > scripts/demo/expected-output/act2-pr-dry-run.json` |
| `closing-dora.json` | `dx dora summarize --events ... --json > scripts/demo/expected-output/closing-dora.json` |

Re-capture after any platform change that affects user-visible output. The
demo's reliability depends on these being current; stale snapshots that
diverge from the live run break the trust the snapshots are supposed to
provide.
