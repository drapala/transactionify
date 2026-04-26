# Local environment

> **PDF requirement (page 4, deliverable 3.a, verbatim):** "A mechanism to run the service and its dependencies locally to execute tests **without cloud latency**."

This document is the offline-path's contract. Read it cold; you should be running tests against the seeded local stack in **5 commands or fewer**.

## What you get

| Layer | Local equivalent | Status |
|---|---|---|
| DynamoDB | LocalStack (community edition, port 4566) | ✅ shipped |
| API Gateway | — | ⛔ out of scope (Pro feature; brittle across machines) |
| Lambda runtime | — | ⛔ out of scope (cold-start regression vector) |
| Live HTTP entry-point | — | ⛔ ADR Future Integrations evolution path |

The local stack approximates **service dependencies**, not the full runtime. The PDF's requirement is satisfied at the dependency layer: `pytest -m 'not pbt'` runs against LocalStack-backed integration tests with no cloud round-trips.

A live HTTP path (`curl http://localhost:8000/...`) was deliberately cut from the PoC — see the ADR Future Integrations section for the rationale (production-code change at module-import time + CDK asset surgery + Lambda cold-start risk).

## 5 commands

```bash
cp .docker/.env.local.example .docker/.env.local       # 1
dx local up --json                                     # 2
aws --endpoint-url http://localhost:4566 \
    --region us-east-1 dynamodb scan \
    --table-name transactionify --select COUNT          # 3
AWS_DEFAULT_REGION=us-east-1 \
  uv run pytest -m 'not pbt' test/unit/src/python/      # 4
dx local down --json                                    # 5
```

`dx local up` polls `http://localhost:4566/_localstack/health` until services report `running`. Timeout is fail-loud: if services aren't healthy within 30s, the command exits non-zero AND does NOT run the seed script (a stale or empty seeded table would mislead the demo).

## Where production code points at LocalStack

`boto3 ≥ 1.31` reads `AWS_ENDPOINT_URL` natively. The fork's existing module-level resource:

```python
boto3.resource("dynamodb", endpoint_url=os.environ.get("AWS_ENDPOINT_URL"))
```

When `AWS_ENDPOINT_URL=http://localhost:4566` is set in the shell, boto3 routes to LocalStack. **No production code change in this ticket.** Setting the env var in the shell (or via `.docker/.env.local`) is the supported override.

## Idempotency

- `dx local up` is idempotent: running twice when already healthy is a no-op.
- The seed script uses `put_item` (overwrites by PK+SK); fixtures stay deterministic.
- `dx local down` cleans containers + volumes; no orphans, no stale state.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `health-check timed out after 30s` | Docker is starting / port 4566 in use / image still pulling. Run `docker logs transactionify-localstack` for service errors. |
| `aws: command not found` | Install AWS CLI v2 — used only for the verification scan. |
| `seed: NoCredentialsError` | `.docker/.env.local` missing. Re-copy from `.docker/.env.local.example`. |

## What's deliberately out of scope (PoC)

- FastAPI/uvicorn local HTTP adapter (production-code change risk + Lambda runtime regression).
- API Gateway emulation (LocalStack Pro feature; flaky on consumer machines).
- Auth/authz fidelity (no live HTTP path means no auth surface).
- Hot reload / debugger toolbars / dev ergonomics beyond LocalStack defaults.
