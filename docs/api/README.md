# Transactionify API — Bruno collection

Executable documentation of the [Transactionify REST API](../../openapi.yaml) as a [Bruno](https://www.usebruno.com) collection.

## Why Bruno (not Postman)

- Plain-text `.bru` files — diffable, code-reviewable, lives in git alongside the OpenAPI spec.
- Local-first; no cloud account, no team-license cost.
- Asserts are inline (see `01-create-account.bru`'s `assert` block) — the collection doubles as a contract-validation harness.

## Files

```
docs/api/
├── README.md              ← this file
├── transactionify.bru     ← collection-level metadata + default vars
├── 01-create-account.bru
├── 02-create-payment.bru
├── 03-get-balance.bru
├── 04-list-transactions.bru
└── environments/
    ├── local.bru          ← LocalStack endpoint (placeholder; live HTTP is evolution path)
    └── staging.bru        ← real-deploy placeholder (evolution path: OIDC-gated deploy)
```

## Provenance

The endpoint shapes mirror `openapi.yaml` 1:1 — the OpenAPI spec is the source-of-truth for the contract, the Bruno collection is the runnable proof. If they drift, fix the contract: regenerate types from the spec, then verify the Bruno asserts still hold.

## Demo usage

The Closing of the demo (per `docs/DEMO.md`) does **not** run live HTTP against this collection — the FastAPI local adapter was cut from PoC scope (ADR Future Integration #2). Instead the Closing narrates: *"the Bruno collection is the artifact a new team would adopt for integration testing once the live local entry-point is built; for the PoC we verify the data layer via `aws --endpoint-url=http://localhost:4566 dynamodb scan` after `dx local up`."*

Do not script live HTTP against this collection in `demo/*.sh`. Ad-hoc runs by the candidate during interview Q&A are fine.
