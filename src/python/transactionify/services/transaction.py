"""Transaction service for managing transactions."""

from typing import Dict, Any, List
from transactionify.tools.aws.dynamodb import query_by_pk, get_by_full_match


def list_transactions(user_id: str, account_id: str) -> List[Dict[str, Any]]:
    """
    List all transactions for an account.

    This function:
    1. Validates that the account exists and belongs to the user
    2. Queries all transactions for the account
    3. Returns list of transactions with id, type, amount, and timestamp

    Args:
        user_id: The user identifier (UUIDv7) from authorization context
        account_id: The account identifier (UUIDv7)

    Returns:
        List of transaction data

    Raises:
        ValueError: If account doesn't exist or doesn't belong to user

    Example:
        >>> transactions = list_transactions("019a4757-c049-7ea8-a110-2ea110c5a6f7", "019a4757-c049-7ea8-a110-2ea110c5a6f8")
        >>> print(transactions)
        [
            {
                "id": "019a4757-c049-7ea8-a110-2ea110c5a6f9",
                "type": "payment",
                "amount": {
                    "value": "100.00",
                    "currency": "USD"
                },
                "timestamp": "2024-02-22T10:00:00Z"
            }
        ]
    """
    # Validate that account exists and belongs to user
    account_pk = f"USER_ID#{user_id}"
    account_sk = f"ACCOUNT#{account_id}"
    account = get_by_full_match(pk=account_pk, sk=account_sk)

    if not account:
        raise ValueError(f"Account not found or does not belong to user")

    # Get account currency
    account_currency = account.get('currency', '')

    # Query all transactions for this account
    transaction_pk = f"ACCOUNT#{account_id}"
    transaction_sk_prefix = "TRANSACTION#"

    transaction_records = query_by_pk(pk=transaction_pk, sk_prefix=transaction_sk_prefix)

    # Transform transaction records to API format
    transactions = []
    for record in transaction_records:
        # Extract transaction ID from SK (format: TRANSACTION#<id>)
        sk = record.get('SK', '')
        transaction_id = sk.replace('TRANSACTION#', '') if sk.startswith('TRANSACTION#') else ''

        # Build transaction object
        transaction = {
            'id': transaction_id,
            'type': record.get('type', 'payment'),
            'amount': {
                'value': record.get('value', '0.00'),
                'currency': record.get('currency', account_currency)
            }
        }

        # Add timestamp
        transaction['timestamp'] = record.get('timestamp', '')

        transactions.append(transaction)

    return transactions
