# Typescript adapter — STUB

**Status:** stub (registry resolves `typescript`; method calls throw `NotImplementedError`).
**File you edit to implement:** `packages/framework/src/adapters/typescript.ts`.
**Tests:** `packages/framework/test/adapters/typescript-stub.test.ts` (current). Add real tests alongside the implementation.

## Contract

To make this adapter real, implement RuntimeAdapter from `packages/framework/src/adapters/runtime-adapter.ts`. Five methods, each returning `{cmd, args, cwd?}`:

| Method | Suggested command |
|---|---|
| `lintCommand` | `pnpm exec eslint .` |
| `unitTestCommand` | `pnpm vitest run` |
| `pbtCommand` | `pnpm vitest run --dir test/pbt` |
| `contractCommand` | `schemathesis run openapi.yaml --checks=all` |
| `packageCommand` | `pnpm exec tsc -p tsconfig.build.json` |

These are starting points, not platform mandates. The platform owns the *shape* (five methods, structured commands, one stack key in the registry); the team owns the *content* (which test runner, which packager). See Design Principle 3.

## Implementation steps

1. Replace the body of each method in `packages/framework/src/adapters/typescript.ts` with a structured `AdapterCommand` return.
2. Drop the `fail()` shim and the `NotImplementedError` import.
3. Add `packages/framework/test/adapters/typescript.test.ts` mirroring `python.test.ts`.
4. Update this doc: change Status from STUB to real, document any conventions (e.g. PBT selection mechanism), example `.dx.yaml`.
5. The registry already resolves `typescript` — no registry change needed.

## Why a stub instead of an empty registry slot

If `registry.resolve('typescript')` threw "not registered", a contributor would not know whether typescript is a planned target or a forgotten case. The stub-with-instructive-error is the finger-post: the platform commits to the four PDF-named stacks structurally, and the InnerSource path is one file away.
