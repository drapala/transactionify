# Python adapter

**Status:** real (dogfooded against `src/python/transactionify/`).
**File:** `packages/framework/src/adapters/python.ts`.
**Tests:** `packages/framework/test/adapters/python.test.ts`.

## Contract

Implements `RuntimeAdapter` (`packages/framework/src/adapters/runtime-adapter.ts`).

| Method | Returns |
|---|---|
| `lintCommand` | `ruff check .` |
| `unitTestCommand` | `pytest -x -q -m 'not pbt'` (cwd = test_root) |
| `pbtCommand` | `pytest -x -q -m pbt` (cwd = test_root) |
| `contractCommand` | `schemathesis run openapi.yaml --hypothesis-deadline=2000 --checks=all` |
| `packageCommand` | service_shape-aware (see below) |

## PBT convention — mark, not directory

Hypothesis-driven property tests are selected by the pytest mark `@pytest.mark.pbt` (registered in `pytest.ini`). The unit and PBT stages run the same `pytest` binary against the same `test_root`, just with `-m 'not pbt'` vs `-m pbt`. This avoids parallel test trees and keeps fixtures in one place.

## test_root

Defaults by `service_shape`:

| service_shape | default test_root |
|---|---|
| `lambda` | `test/unit/src/python` (Transactionify-style) |
| `wheel`  | `tests` (distributable Python) |

Override via `.dx.yaml`:

```yaml
test_root: my/custom/path
```

Without `cwd`, `dx check` invoked from the fork root would let pytest's auto-discovery recurse into `node_modules/`, `cdk.out/`, etc. Setting cwd makes local checks reproduce CI byte-for-byte (Design Principle 2).

## packageCommand by service_shape

- **`lambda`** → `sh -c 'pnpm cdk synth --quiet && tar -czf service-package.tgz cdk.out/'`. The tarball is a packaging convenience for `upload-artifact` + `attest-build-provenance@v1`'s single-subject contract. CDK actually deploys per-asset zips (`cdk.out/asset.<hash>.zip`); per-asset attestation (one subject per asset) is the documented evolution path. The bundle attestation is honest about what it covers.
- **`wheel`** → `uv build`. For Python projects with a root `pyproject.toml`.
- **unset / `binary`** → `AdapterConfigError` with an actionable message.

## Configuring a Python service

```yaml
# .dx.yaml
project: my-service
stack: python
service_shape: lambda     # or wheel
test_root: tests          # optional override
```
