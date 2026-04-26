"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doraEmitStep = void 0;
function doraEmitStep(opts) {
    const isDeployment = opts.eventType === "deployment";
    const lines = [
        "set -euo pipefail",
        "EVENT_ID=$(python3 -c 'import os,time;ts=int(time.time()*1000);b=os.urandom(10);v7=(ts<<80)|(7<<76)|((b[0]&0x0f)<<72)|(b[1]<<64)|((b[2]&0x3f|0x80)<<56)|(int.from_bytes(b[3:10],\"big\"));h=v7.to_bytes(16,\"big\").hex();print(f\"{h[0:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}\")')",
        `OUTCOME="${opts.outcomeFromJob}"`,
        'STARTED_AT="${{ github.event.repository.updated_at }}"',
        'FINISHED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"',
        // Untrusted GitHub event fields are passed through env (RAW_TITLE) — see
        // step.env below. printf "%s" + quoted var is the canonical-safe pattern.
        'WORK_ID=$(printf "%s" "$RAW_TITLE" | grep -oE "(LL|GP)-[0-9]+[a-z]?" | head -1 || echo "GP-0")',
        'CHANGE_SUMMARY=$(printf "%s" "$RAW_TITLE" | head -c 240)',
    ];
    if (isDeployment) {
        lines.push('COMMIT_AUTHORED_AT="$(git show -s --format=%aI ${{ github.sha }})"');
    }
    // Build JSON via `jq -n --arg ...` — every interpolated string is escaped
    // by jq, so a PR title containing a quote or backslash produces valid JSON.
    // Heredoc-based construction (earlier draft) would have produced invalid
    // JSON on quote-containing titles.
    lines.push("mkdir -p dora-events", "jq -n \\", '  --arg event_id "$EVENT_ID" \\', `  --arg event_type "${opts.eventType}" \\`, `  --arg service "${opts.service}" \\`, '  --arg repository "${{ github.repository }}" \\', '  --arg commit_sha "${{ github.sha }}" \\', '  --arg actor "${{ github.actor }}" \\', '  --arg work_id "$WORK_ID" \\', '  --arg change_summary "$CHANGE_SUMMARY" \\', '  --arg outcome "$OUTCOME" \\', '  --arg started_at "$STARTED_AT" \\', '  --arg finished_at "$FINISHED_AT" \\', '  --arg run_id "${{ github.run_id }}" \\', '  --arg source_url "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \\');
    if (isDeployment) {
        lines.push('  --arg commit_authored_at "$COMMIT_AUTHORED_AT" \\');
    }
    // Construct the object. Field order in the produced JSON matches the
    // schema's required list for readability.
    const fields = [
        "event_id: $event_id",
        'schema_version: "1.0.0"',
        "event_type: $event_type",
        "service: $service",
        "repository: $repository",
        "commit_sha: $commit_sha",
        "actor: $actor",
        "work_id: $work_id",
        "change_summary: $change_summary",
        "outcome: $outcome",
        "started_at: $started_at",
        "finished_at: $finished_at",
        'source: "ci"',
        "run_id: $run_id",
        "source_url: $source_url",
    ];
    if (isDeployment) {
        fields.push("commit_authored_at: $commit_authored_at");
        fields.push("is_rework: false");
    }
    lines.push(`  '{${fields.join(", ")}}' > dora-events/event.json`);
    // Validate the produced JSON against the schema. Fail loud rather than
    // upload a malformed event.
    lines.push("python3 -m pip install --quiet jsonschema");
    lines.push("python3 -c 'import json,sys;from jsonschema import Draft202012Validator;e=json.load(open(\"dora-events/event.json\"));s=json.load(open(\"packages/shared-schemas/dora-event.schema.json\"));errs=list(Draft202012Validator(s).iter_errors(e));sys.exit(0 if not errs else (print(errs[0].message),1)[1])'");
    return {
        name: "emit DORA event",
        run: lines.join("\n"),
        env: {
            RAW_TITLE: "${{ github.event.pull_request.title || github.event.head_commit.message }}",
        },
    };
}
exports.doraEmitStep = doraEmitStep;
