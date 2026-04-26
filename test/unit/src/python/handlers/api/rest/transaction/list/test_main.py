"""Tests for list transactions Lambda handler."""

import json
import pytest
from unittest.mock import patch
from src.python.transactionify.handlers.api.rest.transaction.list.main import handler


class TestListTransactionsHandler:
    """Test cases for the list transactions Lambda handler."""

    @patch('src.python.transactionify.handlers.api.rest.transaction.list.main.list_transactions')
    def test_handler_success(self, mock_list_transactions):
        """Test successful transaction listing.

        Updated for upstream commit a0d9b5e ("Added pagination"): the service
        returns a dict {'transactions': [...], 'has_more': bool, 'next_cursor':
        ...} not a flat list. Handler calls .get('transactions', ...) on the
        result, so the mock must return the dict shape (was a list pre-pagination).
        """
        mock_list_transactions.return_value = {
            'transactions': [
                {
                    'id': '019a4757-c049-7ea8-a110-2ea110c5a6f9',
                    'type': 'payment',
                    'amount': {'value': '100.00', 'currency': 'USD'},
                    'timestamp': '2024-02-22T10:00:00Z',
                },
                {
                    'id': '019a4757-c049-7ea8-a110-2ea110c5a700',
                    'type': 'payment',
                    'amount': {'value': '50.00', 'currency': 'USD'},
                    'timestamp': '2024-02-22T11:00:00Z',
                },
            ],
            'has_more': False,
        }

        event = {
            'requestContext': {
                'authorizer': {'lambda': {'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'}}
            },
            'pathParameters': {'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8'},
        }

        response = handler(event, None)

        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        txs = body['transactions']
        assert len(txs) == 2
        assert txs[0]['id'] == '019a4757-c049-7ea8-a110-2ea110c5a6f9'
        assert txs[0]['type'] == 'payment'
        assert txs[0]['amount']['value'] == '100.00'
        assert txs[0]['timestamp'] == '2024-02-22T10:00:00Z'
        # Handler now passes limit + cursor through; assert keyword args.
        mock_list_transactions.assert_called_once_with(
            '019a4757-c049-7ea8-a110-2ea110c5a6f7',
            '019a4757-c049-7ea8-a110-2ea110c5a6f8',
            limit=20,
            cursor=None,
        )

    @patch('src.python.transactionify.handlers.api.rest.transaction.list.main.list_transactions')
    def test_handler_empty_list(self, mock_list_transactions):
        """Test successful listing with no transactions (paginated dict shape)."""
        mock_list_transactions.return_value = {'transactions': [], 'has_more': False}

        event = {
            'requestContext': {
                'authorizer': {'lambda': {'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'}}
            },
            'pathParameters': {'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8'},
        }

        response = handler(event, None)

        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['transactions'] == []
        assert body['has_more'] is False

    def test_handler_missing_user_id(self):
        """Test error when user_id is missing from authorizer context."""
        event = {
            'requestContext': {
                'authorizer': {
                    'lambda': {}
                }
            },
            'pathParameters': {
                'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8'
            }
        }

        response = handler(event, None)

        assert response['statusCode'] == 401
        body = json.loads(response['body'])
        assert body['message'] == 'Unauthorized'

    def test_handler_missing_account_id(self):
        """Test error when account_id is missing from path parameters."""
        event = {
            'requestContext': {
                'authorizer': {
                    'lambda': {
                        'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'
                    }
                }
            },
            'pathParameters': {}
        }

        response = handler(event, None)

        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert body['message'] == 'Account not found'

    @patch('src.python.transactionify.handlers.api.rest.transaction.list.main.list_transactions')
    def test_handler_account_not_found(self, mock_list_transactions):
        """Test error when account doesn't exist."""
        mock_list_transactions.side_effect = ValueError('Account not found or does not belong to user')

        event = {
            'requestContext': {
                'authorizer': {
                    'lambda': {
                        'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'
                    }
                }
            },
            'pathParameters': {
                'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8'
            }
        }

        response = handler(event, None)

        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert body['message'] == 'Account not found'

    @patch('src.python.transactionify.handlers.api.rest.transaction.list.main.list_transactions')
    def test_handler_internal_error(self, mock_list_transactions):
        """Test error handling for internal errors."""
        mock_list_transactions.side_effect = Exception('DynamoDB error')

        event = {
            'requestContext': {
                'authorizer': {
                    'lambda': {
                        'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'
                    }
                }
            },
            'pathParameters': {
                'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8'
            }
        }

        response = handler(event, None)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert body['message'] == 'An error occurred while retrieving transactions'

    @patch('src.python.transactionify.handlers.api.rest.transaction.list.main.list_transactions')
    def test_handler_does_not_expose_internal_errors(self, mock_list_transactions):
        """Test that internal error details are not exposed to clients."""
        mock_list_transactions.side_effect = Exception('Database connection failed: host=internal-db.company.com')

        event = {
            'requestContext': {
                'authorizer': {
                    'lambda': {
                        'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'
                    }
                }
            },
            'pathParameters': {
                'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8'
            }
        }

        response = handler(event, None)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert body['message'] == 'An error occurred while retrieving transactions'
        # Verify internal details are NOT in the response
        assert 'Database connection' not in body['message']
        assert 'internal-db.company.com' not in body['message']
