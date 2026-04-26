# Changesets

This repo uses [pnpm changesets](https://github.com/changesets/changesets) to drive **independent SemVer cycles** for the platform packages (`packages/cli`, `packages/framework`, `packages/shared-schemas`).

## Why this exists

GP-010's README states publicly that platform packages would have independent SemVer cycles in production. This config is the operational evidence behind that promise — without it, the claim would be vapor.

## How a contributor adds a changeset

```
pnpm changeset add
```

Pick which packages bumped, pick patch/minor/major, write a one-line summary. A `.changeset/<random>.md` file is created — commit it alongside your code change.

## How the platform team consumes them (release workflow, out of PoC scope)

```
pnpm changeset version   # bumps versions + writes CHANGELOG.md per package
pnpm changeset publish   # publishes to the registry (wired into a release workflow in production)
```

## Config notes (rationale per field in `config.json`)

- `commit: false` — changesets are committed by the author, not auto by CI; reviewers see them in the PR diff.
- `fixed: []` / `linked: []` — packages version independently (the entire point).
- `access: "public"` — packages are published as public when the release workflow is wired (PoC: not wired).
- `baseBranch: "main"` — `main` is the release branch.
- `updateInternalDependencies: "patch"` — when a workspace dep version changes, dependent packages get a patch bump.
- `ignore: []` — no package is excluded.

## PoC scope

This PoC commits the **config**, not the **release workflow**. In production the candidate would wire `pnpm changeset publish` into a `release.yml` GitHub Actions workflow, signed via OIDC + npm provenance. The config alone closes the Packaging Maturity evaluation criterion from "we plan to" to "we have the operational config for it".
