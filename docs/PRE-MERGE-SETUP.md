# Pre-merge setup — what the reviewer needs before reproducing the demo

> **Goal:** make the live demo (`DEMO.md`) reproducible on the reviewer's machine in <10 minutes. Every precondition below is checked by `bash demo/preflight.sh`; this document is the human-readable version with install commands.

---

## Tooling (one-time)

```bash
# macOS — assumes Homebrew. On Linux, use the equivalent package manager.
brew install pandoc poppler jq actionlint awscli gh pnpm uv
brew install --cask docker            # or Docker Desktop manually

# Python deps for weasyprint (only needed if you regenerate the ADR PDF locally)
brew install pango
```

Verification:

```bash
bash tests/workspace/test_workspace_health.sh   # all base tooling green
```

---

## GitHub state — needed for Act 1 + Act 2 (live API calls)

The demo uses the **candidate-controlled fork** at `drapala/transactionify` (or your own fork — the preflight detects it from `git remote get-url origin`).

### 1. Fork + admin

```bash
gh repo fork rrgarciach/transactionify --remote-name=upstream --clone=false
git remote set-url origin https://github.com/<YOUR_USER>/transactionify.git
gh auth login                          # or: gh auth refresh -h github.com -s admin:org,write:repo_hook,admin:public_key
gh api /repos/<YOUR_USER>/transactionify --jq '.permissions.admin'   # must print true
```

### 2. Default branch must be `main`

```bash
gh api /repos/<YOUR_USER>/transactionify --jq '.default_branch'   # must print "main"
# If not, rename via gh:
# gh api -X POST /repos/<YOUR_USER>/transactionify/branches/<old>/rename -f new_name=main
```

### 3. Amazon Q Developer App installed on your fork

Without this, the `ai-review` CI job posts `/q review` and Q never replies — the step exits 0 (it's `continue-on-error: true`) but the demo's "AI feedback appears" beat is missing.

1. Open https://github.com/apps/amazon-q-developer.
2. **Configure** → choose **Only select repositories** → add `<YOUR_USER>/transactionify`.
3. Verify:
   ```bash
   gh api /user/installations --jq '.installations[].app_slug' | grep amazon-q
   ```

### 4. Repo variable `AMAZON_Q_REVIEW_ENABLED=true`

The workflow's `gh pr comment /q review` step is gated on this. Without it, the step skips silently — even if the App is installed.

```bash
gh variable set AMAZON_Q_REVIEW_ENABLED --repo <YOUR_USER>/transactionify --body true
```

---

## Local services — needed for `dx local up` + Act 3

```bash
# Docker daemon must be running.
docker info > /dev/null   # exits 0 if reachable

# AWS CLI v2 only used to verify the seeded LocalStack table.
aws --version             # aws-cli/2.x

# Dummy AWS env (LocalStack accepts any non-empty values).
cp .docker/.env.local.example .docker/.env.local
```

---

## Repo state — clean tree

```bash
cd transactionify
pnpm install                     # workspace deps
uv sync --all-packages           # CLI + framework Python deps in shared .venv
uv tool install --editable packages/cli   # puts `dx` on PATH
```

---

## Final preflight (60 seconds)

```bash
bash demo/preflight.sh
```

All ✓ green = ready. Any ✗ red = fix before stage.

---

## Optional: regenerate artifacts

If anything looks stale relative to current code, rebuild:

```bash
# regenerate framework dist (consumers expect compiled JS in node_modules)
pnpm --filter @golden-path/framework run build

# regenerate workflow YAMLs from the framework
pnpm --filter @golden-path/framework exec tsx scripts/regenerate-workflows.ts

# regenerate the cross-language manifest (Python → JSON for TS)
uv run python -m dx.checks.manifest_codegen --out packages/framework/src/generated/check-manifest.json

# regenerate ADR PDF (requires pango + weasyprint)
pandoc docs/ADR/0001-golden-path.md --standalone --css /tmp/adr-style.css --embed-resources -o /tmp/adr.html
DYLD_LIBRARY_PATH=/opt/homebrew/lib uv run weasyprint /tmp/adr.html docs/ADR/0001-golden-path.pdf
pdfinfo docs/ADR/0001-golden-path.pdf | grep Pages   # must be 2
```

---

## Common failure modes

| Symptom | Likely cause |
|---|---|
| `dx: command not found` | run `uv tool install --editable packages/cli` (or `--from git+...` for end-user flow) |
| `dx local up` health timeout | Docker daemon not running, or port 4566 already in use |
| `dx governance apply` 403 | gh user lacks admin permission; run `gh auth refresh` with admin scope |
| `gh ruleset list --json` "unknown flag" | older gh version; use `gh api /repos/.../rulesets` instead |
| `cdk synth` "Cannot find module 'source-map-support'" | run `pnpm install` (the dep was added in GP-009a; older clones missed the pin) |
| `pytest -m pbt` exits 5 (no tests collected) | `hypothesis` not installed; run `pip install -r test/unit/src/python/requirements.txt` |
