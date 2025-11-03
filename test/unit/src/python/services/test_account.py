"""Tests for account service."""

import pytest
from unittest.mock import patch
from src.python.transactionify.services.account import create_account, ALLOWED_CURRENCIES


class TestCreateAccount:
    """Test cases for create_account function."""

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_usd(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test successful account creation with USD."""
        mock_generate_uuid.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f8'
        mock_get_ttl.return_value = 1234567890

        result = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'USD')

        # Verify account record was created
        assert mock_put_item.call_count == 2

        # First call: account record
        account_call = mock_put_item.call_args_list[0]
        assert account_call[1]['pk'] == 'USER_ID#019a4757-c049-7ea8-a110-2ea110c5a6f7'
        assert account_call[1]['sk'] == 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8'
        assert account_call[1]['attributes'] == {
            'currency': 'USD',
            'ttl': 1234567890
        }

        # Second call: balance record
        balance_call = mock_put_item.call_args_list[1]
        assert balance_call[1]['pk'] == 'ACCOUNT#019a4757-c049-7ea8-a110-2ea110c5a6f8'
        assert balance_call[1]['sk'] == 'BALANCE'
        assert balance_call[1]['attributes'] == {
            'value': '0.00',
            'ttl': 1234567890
        }

        # Verify return value
        assert result == {
            'account_id': '019a4757-c049-7ea8-a110-2ea110c5a6f8',
            'currency': 'USD',
            'balance': {
                'value': '0.00',
                'currency': 'USD'
            }
        }

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_eur(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test successful account creation with EUR."""
        mock_generate_uuid.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f8'
        mock_get_ttl.return_value = 1234567890

        result = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'EUR')

        assert result['currency'] == 'EUR'
        assert result['balance']['currency'] == 'EUR'

        # Verify account record has EUR
        account_call = mock_put_item.call_args_list[0]
        assert account_call[1]['attributes']['currency'] == 'EUR'

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_gbp(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test successful account creation with GBP."""
        mock_generate_uuid.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f8'
        mock_get_ttl.return_value = 1234567890

        result = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'GBP')

        assert result['currency'] == 'GBP'
        assert result['balance']['currency'] == 'GBP'

    def test_create_account_invalid_currency(self):
        """Test that invalid currency raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'JPY')

        assert 'Invalid currency' in str(exc_info.value)
        assert 'USD, EUR, GBP' in str(exc_info.value)

    def test_create_account_empty_currency(self):
        """Test that empty currency raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', '')

        assert 'Invalid currency' in str(exc_info.value)

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_initial_balance_zero(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test that initial balance is always 0.00."""
        mock_generate_uuid.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f8'
        mock_get_ttl.return_value = 1234567890

        result = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'USD')

        assert result['balance']['value'] == '0.00'

        # Verify balance record has 0.00
        balance_call = mock_put_item.call_args_list[1]
        assert balance_call[1]['attributes']['value'] == '0.00'

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_has_ttl(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test that account and balance records have TTL."""
        mock_generate_uuid.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f8'
        mock_get_ttl.return_value = 1234567890

        create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'USD')

        # Verify both records have TTL
        account_call = mock_put_item.call_args_list[0]
        assert account_call[1]['attributes']['ttl'] == 1234567890

        balance_call = mock_put_item.call_args_list[1]
        assert balance_call[1]['attributes']['ttl'] == 1234567890

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_generates_uuid(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test that account_id is generated as UUIDv7."""
        mock_generate_uuid.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f8'
        mock_get_ttl.return_value = 1234567890

        result = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'USD')

        # Verify UUID generator was called
        mock_generate_uuid.assert_called_once()

        # Verify generated UUID is returned
        assert result['account_id'] == '019a4757-c049-7ea8-a110-2ea110c5a6f8'

    @patch('src.python.transactionify.services.account.generate_uuidv7')
    @patch('src.python.transactionify.services.account.get_ttl_2_weeks')
    @patch('src.python.transactionify.services.account.put_item')
    def test_create_account_multiple_calls_unique(self, mock_put_item, mock_get_ttl, mock_generate_uuid):
        """Test that multiple account creations generate unique account IDs."""
        mock_generate_uuid.side_effect = [
            '019a4757-c049-7ea8-a110-2ea110c5a6f8',
            '019a4757-c049-7ea8-a110-2ea110c5a6f9',
            '019a4757-c049-7ea8-a110-2ea110c5a6fa'
        ]
        mock_get_ttl.return_value = 1234567890

        account1 = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'USD')
        account2 = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'EUR')
        account3 = create_account('019a4757-c049-7ea8-a110-2ea110c5a6f7', 'GBP')

        assert account1['account_id'] != account2['account_id'] != account3['account_id']
        assert mock_generate_uuid.call_count == 3


class TestAllowedCurrencies:
    """Test cases for ALLOWED_CURRENCIES constant."""

    def test_allowed_currencies_list(self):
        """Test that ALLOWED_CURRENCIES contains expected values."""
        assert ALLOWED_CURRENCIES == ['USD', 'EUR', 'GBP']

    def test_allowed_currencies_immutable(self):
        """Test that ALLOWED_CURRENCIES is a list (not tuple for easier testing)."""
        assert isinstance(ALLOWED_CURRENCIES, list)
