# Go adapter — STUB

**Status:** stub (registry resolves `go`; method calls throw `NotImplementedError`).
**File you edit to implement:** `packages/framework/src/adapters/go.ts`.
**Tests:** `packages/framework/test/adapters/go-stub.test.ts` (current). Add real tests alongside the implementation.

## Contract

To make this adapter real, implement RuntimeAdapter from `packages/framework/src/adapters/runtime-adapter.ts`. Five methods, each returning `{cmd, args, cwd?}`:

| Method | Suggested command |
|---|---|
| `lintCommand` | `go vet ./...` |
| `unitTestCommand` | `go test ./...` |
| `pbtCommand` | `go test -tags=pbt ./...` |
| `contractCommand` | `schemathesis run openapi.yaml --checks=all` |
| `packageCommand` | `go build -o bin/service ./cmd/service` |

These are starting points, not platform mandates. The platform owns the *shape* (five methods, structured commands, one stack key in the registry); the team owns the *content* (which test runner, which packager). See Design Principle 3.

## Implementation steps

1. Replace the body of each method in `packages/framework/src/adapters/go.ts` with a structured `AdapterCommand` return.
2. Drop the `fail()` shim and the `NotImplementedError` import.
3. Add `packages/framework/test/adapters/go.test.ts` mirroring `python.test.ts`.
4. Update this doc: change Status from STUB to real, document any conventions (e.g. PBT selection mechanism), example `.dx.yaml`.
5. The registry already resolves `go` — no registry change needed.

## Why a stub instead of an empty registry slot

If `registry.resolve('go')` threw "not registered", a contributor would not know whether go is a planned target or a forgotten case. The stub-with-instructive-error is the finger-post: the platform commits to the four PDF-named stacks structurally, and the InnerSource path is one file away.
