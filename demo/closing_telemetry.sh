#!/usr/bin/env bash
# Act 3 / closing — DORA aggregator over a fixture (or a real artifact).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

EVENTS="${EVENTS:-packages/cli/tests/fixtures/dora-events/mixed-failure-recovery.jsonl}"

echo "▎ aggregate $EVENTS"
dx dora summarize --events "$EVENTS" --window 7d

echo ""
echo "▎ same code path, different stack — the schema is the contract"
dx dora summarize --events packages/cli/tests/fixtures/dora-events/single-success.jsonl --window 7d --json \
  | jq '{deployment_frequency, lead_time_for_changes_seconds, change_failure_rate, mean_time_to_restore_seconds}'
