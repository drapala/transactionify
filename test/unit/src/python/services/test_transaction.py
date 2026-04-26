"""Tests for transaction service.

Updated for upstream commit a0d9b5e ("Added pagination for transactions"):
  - patch targets services.transaction.query_by_pk_paginated; the
    pre-pagination bare-symbol form is no longer in the module's namespace.
  - mock return values are dict-shaped {'items': [...], 'last_evaluated_key': ...}
    matching the paginated DynamoDB API.
  - service returns dict {'transactions': [...], 'has_more': bool, 'next_cursor': ...}
    not a flat list — assertions updated accordingly.
"""

import pytest
from unittest.mock import patch
from src.python.transactionify.services.transaction import list_transactions


class TestListTransactions:
    """Test cases for list_transactions function."""

    @patch('src.python.transactionify.services.transaction.query_by_pk_paginated')
    @patch('src.python.transactionify.services.transaction.get_by_full_match')
    def test_list_transactions_success(self, mock_get_item, mock_query):
        """Test successful transaction listing."""
        mock_get_item.return_value = {
            'PK': 'USER_ID#019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'SK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
            'currency': 'USD',
        }
        mock_query.return_value = {
            'items': [
                {
                    'PK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
                    'SK': 'TRANSACTION#019a4757-c049-7ea8-a110-2ea110c5a6f9',
                    'type': 'payment',
                    'value': '100.00',
                    'currency': 'USD',
                    'timestamp': '2024-02-22T10:00:00Z',
                },
                {
                    'PK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
                    'SK': 'TRANSACTION#019a4757-c049-7ea8-a110-2ea110c5a700',
                    'type': 'payment',
                    'value': '50.00',
                    'currency': 'USD',
                    'timestamp': '2024-02-22T11:00:00Z',
                },
            ],
            # No last_evaluated_key → has_more=False, no next_cursor.
        }

        result = list_transactions(
            user_id='019a4757-c049-7ea8-a110-2ea110c5a6f7',
            account_id='019a4757-c049-7ea8-a110-2ea110c5a6f8',
        )

        txs = result['transactions']
        assert len(txs) == 2
        assert txs[0]['id'] == '019a4757-c049-7ea8-a110-2ea110c5a6f9'
        assert txs[0]['type'] == 'payment'
        assert txs[0]['amount']['value'] == '100.00'
        assert txs[0]['amount']['currency'] == 'USD'
        assert txs[0]['timestamp'] == '2024-02-22T10:00:00Z'
        assert txs[1]['id'] == '019a4757-c049-7ea8-a110-2ea110c5a700'
        assert txs[1]['amount']['value'] == '50.00'
        assert result['has_more'] is False
        assert 'next_cursor' not in result

    @patch('src.python.transactionify.services.transaction.query_by_pk_paginated')
    @patch('src.python.transactionify.services.transaction.get_by_full_match')
    def test_list_transactions_empty(self, mock_get_item, mock_query):
        """Test transaction listing with no transactions."""
        mock_get_item.return_value = {
            'PK': 'USER_ID#019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'SK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
            'currency': 'EUR',
        }
        mock_query.return_value = {'items': []}

        result = list_transactions(
            user_id='019a4757-c049-7ea8-a110-2ea110c5a6f7',
            account_id='019a4757-c049-7ea8-a110-2ea110c5a6f8',
        )

        assert result['transactions'] == []
        assert result['has_more'] is False

    @patch('src.python.transactionify.services.transaction.get_by_full_match')
    def test_list_transactions_account_not_found(self, mock_get_item):
        """Test error when account doesn't exist."""
        mock_get_item.return_value = None

        with pytest.raises(ValueError) as exc_info:
            list_transactions(
                user_id='019a4757-c049-7ea8-a110-2ea110c5a6f7',
                account_id='019a4757-c049-7ea8-a110-2ea110c5a6f8',
            )

        assert 'Account not found' in str(exc_info.value)

    @patch('src.python.transactionify.services.transaction.get_by_full_match')
    def test_list_transactions_validates_user_ownership(self, mock_get_item):
        """Test that listing validates account belongs to user."""
        mock_get_item.return_value = None

        with pytest.raises(ValueError):
            list_transactions(
                user_id='019a4757-c049-7ea8-a110-2ea110c5a6f7',
                account_id='019a4757-c049-7ea8-a110-2ea110c5a6f8',
            )

        mock_get_item.assert_called_once_with(
            pk='USER_ID#019a4757-c049-7ea8-a110-2ea110c5a6f7',
            sk='ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
        )

    @patch('src.python.transactionify.services.transaction.query_by_pk_paginated')
    @patch('src.python.transactionify.services.transaction.get_by_full_match')
    def test_list_transactions_uses_account_currency(self, mock_get_item, mock_query):
        """Test that transactions use account currency if not specified."""
        mock_get_item.return_value = {
            'PK': 'USER_ID#019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'SK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
            'currency': 'GBP',
        }
        mock_query.return_value = {
            'items': [
                {
                    'PK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
                    'SK': 'TRANSACTION#019a4757-c049-7ea8-a110-2ea110c5a6f9',
                    'type': 'payment',
                    'value': '75.50',
                    'timestamp': '2024-02-22T10:00:00Z',
                    # No currency field
                },
            ],
        }

        result = list_transactions(
            user_id='019a4757-c049-7ea8-a110-2ea110c5a6f7',
            account_id='019a4757-c049-7ea8-a110-2ea110c5a6f8',
        )

        txs = result['transactions']
        assert len(txs) == 1
        assert txs[0]['amount']['currency'] == 'GBP'

    @patch('src.python.transactionify.services.transaction.query_by_pk_paginated')
    @patch('src.python.transactionify.services.transaction.get_by_full_match')
    def test_list_transactions_query_parameters(self, mock_get_item, mock_query):
        """Test that query is called with correct parameters (PK + SK prefix + limit + cursor)."""
        mock_get_item.return_value = {
            'PK': 'USER_ID#019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'SK': 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
            'currency': 'USD',
        }
        mock_query.return_value = {'items': []}

        list_transactions(
            user_id='019a4757-c049-7ea8-a110-2ea110c5a6f7',
            account_id='019a4757-c049-7ea8-a110-2ea110c5a6f8',
        )

        mock_query.assert_called_once_with(
            pk='ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8',
            sk_prefix='TRANSACTION#',
            limit=20,
            exclusive_start_key=None,
        )
