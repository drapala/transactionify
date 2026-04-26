"""Seed LocalStack DynamoDB with deterministic fixtures.

Idempotent: uses put_item which overwrites by PK+SK; running twice is a no-op
in terms of final table state. Uses fixed UUIDs so the demo can grep for them.
"""
from __future__ import annotations

import os
import sys

import boto3

ENDPOINT = os.environ.get("AWS_ENDPOINT_URL", "http://localhost:4566")
TABLE = os.environ.get("TRANSACTIONIFY_TABLE", "transactionify")

USER_ID = "019a4757-c049-7ea8-a110-2ea110c5a6f7"
ACCOUNT_ID = "019a4757-c049-7ea8-a110-2ea110c5a6f8"

ITEMS = [
    {
        "PK": f"USER_ID#{USER_ID}",
        "SK": f"ACCOUNT#{ACCOUNT_ID}",
        "currency": "USD",
        "balance": "1000.00",
    },
    {
        "PK": f"ACCOUNT#{ACCOUNT_ID}",
        "SK": "TRANSACTION#019a4757-c049-7ea8-a110-2ea110c5a6f9",
        "type": "payment",
        "value": "100.00",
        "currency": "USD",
        "timestamp": "2024-02-22T10:00:00Z",
    },
    {
        "PK": f"ACCOUNT#{ACCOUNT_ID}",
        "SK": "TRANSACTION#019a4757-c049-7ea8-a110-2ea110c5a700",
        "type": "payment",
        "value": "50.00",
        "currency": "USD",
        "timestamp": "2024-02-22T11:00:00Z",
    },
]


def main() -> int:
    ddb = boto3.resource("dynamodb", endpoint_url=ENDPOINT)
    table = ddb.Table(TABLE)
    for item in ITEMS:
        table.put_item(Item=item)
    print(f"seed: wrote {len(ITEMS)} items to {TABLE}", file=sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
