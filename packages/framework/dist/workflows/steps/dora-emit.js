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
        // step.env below. Inline ${{ ... }} interpolation in shell would let a
        // malicious PR title execute code in the runner.
        'WORK_ID=$(printf "%s" "$RAW_TITLE" | grep -oE "(LL|GP)-[0-9]+" | head -1 || echo "GP-0")',
        'CHANGE_SUMMARY=$(printf "%s" "$RAW_TITLE" | head -c 240)',
    ];
    if (isDeployment) {
        lines.push('COMMIT_AUTHORED_AT="$(git show -s --format=%aI ${{ github.sha }})"');
    }
    // Build JSON via heredoc with all required fields per shared-schemas.
    lines.push("mkdir -p dora-events", "cat > dora-events/event.json <<JSON", "{", `  "event_id": "$EVENT_ID",`, `  "schema_version": "1.0.0",`, `  "event_type": "${opts.eventType}",`, `  "service": "${opts.service}",`, `  "repository": "${'${{ github.repository }}'}",`, `  "commit_sha": "${'${{ github.sha }}'}",`, `  "actor": "${'${{ github.actor }}'}",`, `  "work_id": "$WORK_ID",`, `  "change_summary": "$CHANGE_SUMMARY",`, `  "outcome": "$OUTCOME",`, `  "started_at": "$STARTED_AT",`, `  "finished_at": "$FINISHED_AT",`, `  "source": "ci",`, `  "run_id": "${'${{ github.run_id }}'}",`, `  "source_url": "${'${{ github.server_url }}'}/${'${{ github.repository }}'}/actions/runs/${'${{ github.run_id }}'}"${isDeployment ? "," : ""}`);
    if (isDeployment) {
        lines.push(`  "commit_authored_at": "$COMMIT_AUTHORED_AT",`);
        lines.push(`  "is_rework": false`);
    }
    lines.push("}");
    lines.push("JSON");
    // Validate against schema (uses dx package's _yaml_validate which also handles JSON).
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
