"""Lambda handler for listing account transactions."""

import json
from typing import Dict, Any
from transactionify.tools.response import ok, unauthorized, not_found, internal_server_error
from transactionify.services.transaction import list_transactions


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    List all transactions for an account.

    The user_id comes from the authorizer context.
    The account_id comes from the path parameters.

    Event format:
    {
        "requestContext": {
            "authorizer": {
                "lambda": {
                    "user_id": "019a4757-c049-7ea8-a110-2ea110c5a6f7"
                }
            }
        },
        "pathParameters": {
            "account_id": "019a4757-c049-7ea8-a110-2ea110c5a6f8"
        }
    }

    Args:
        event: API Gateway event with user_id in authorizer context and account_id in path
        context: Lambda context object

    Returns:
        API Gateway response with list of transactions

    Example response:
        {
            "statusCode": 200,
            "body": "[{\"id\": \"...\", \"type\": \"payment\", \"amount\": {...}, \"timestamp\": \"...\"}]"
        }
    """
    print(f"List transactions event: {json.dumps(event)}")

    # Extract user_id from authorizer context
    try:
        user_id = event['requestContext']['authorizer']['lambda']['user_id']
    except (KeyError, TypeError):
        return unauthorized('Unauthorized')

    # Extract account_id from path parameters
    try:
        account_id = event['pathParameters']['account_id']
    except (KeyError, TypeError):
        return not_found('Account not found')

    # List transactions
    try:
        transactions = list_transactions(user_id, account_id)
        print(f"Successfully retrieved {len(transactions)} transactions for account: {account_id}")

        return ok(transactions)

    except ValueError as e:
        # Validation error from service - log the actual error but return safe message
        print(f"Validation error listing transactions: {str(e)}")
        error_msg = str(e).lower()

        # Check for specific error types
        if 'account not found' in error_msg or 'does not belong' in error_msg:
            return not_found('Account not found')

        # Generic validation error
        return not_found('Resource not found')

    except Exception as e:
        # Log the actual error for debugging
        error_msg = f"Failed to list transactions: {str(e)}"
        print(error_msg)
        # Return safe generic message to client
        return internal_server_error('An error occurred while retrieving transactions')
