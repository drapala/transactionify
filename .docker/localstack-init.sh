#!/usr/bin/env bash
# Runs inside the LocalStack container after services come up. Creates the
# DynamoDB table transactionify expects. Idempotent — recreating a table
# that exists is a no-op (LocalStack returns ResourceInUseException; we swallow it).
set -euo pipefail

TABLE_NAME=${TRANSACTIONIFY_TABLE:-transactionify}

awslocal dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  >/dev/null 2>&1 || echo "table $TABLE_NAME already exists; skipping create"

echo "localstack-init: table $TABLE_NAME ready"
