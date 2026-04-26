#!/usr/bin/env bash
# End-to-end: bring LocalStack up, seed, and verify via aws --endpoint-url.
# Skips itself loudly when Docker is not available (PoC reality on CI machines
# without Docker-in-Docker). Validation_command #8 invokes this script.
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "SKIP: docker CLI not on PATH; integration test cannot run in this environment."
  exit 0
fi
if ! docker info >/dev/null 2>&1; then
  echo "SKIP: docker daemon not reachable; integration test cannot run."
  exit 0
fi
if ! command -v aws >/dev/null 2>&1; then
  echo "SKIP: aws CLI not on PATH; cannot verify seeded items."
  exit 0
fi

cd "$(git rev-parse --show-toplevel)"

# Cleanup before in case a previous run left orphans.
docker compose down -v >/dev/null 2>&1 || true

uv run dx local up --timeout 60 --json
trap 'uv run dx local down --json >/dev/null 2>&1 || true' EXIT

# Verify the seed populated the table.
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
items_count=$(aws --endpoint-url http://localhost:4566 dynamodb scan --table-name transactionify --select COUNT --output text --query 'Count')
test "$items_count" -ge 3 || { echo "ERROR: expected >=3 seeded items, got $items_count"; exit 1; }
echo "integration: $items_count items in transactionify table"
