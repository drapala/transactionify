import pytest
from unittest.mock import patch
from src.python.transactionify.services.api_key import get_api_key, register_new_api_key


class TestGetApiKey:
    """Test cases for get_api_key function."""

    @patch('src.python.transactionify.services.api_key.get_by_full_match')
    @patch('src.python.transactionify.services.api_key.is_expired')
    def test_get_api_key_success(self, mock_is_expired, mock_get_item):
        """Test successful API key retrieval."""
        mock_get_item.return_value = {
            'PK': 'API_KEY#019a4757-c049-7ea8-a110-2ea110c5a6f6',
            'SK': '',
            'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'ttl': 9999999999
        }
        mock_is_expired.return_value = False

        result = get_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f6')

        assert result == {
            'PK': 'API_KEY#019a4757-c049-7ea8-a110-2ea110c5a6f6',
            'SK': '',
            'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'ttl': 9999999999
        }
        mock_get_item.assert_called_once_with(
            pk='API_KEY#019a4757-c049-7ea8-a110-2ea110c5a6f6',
            sk='METADATA'
        )

    @patch('src.python.transactionify.services.api_key.get_by_full_match')
    def test_get_api_key_not_found(self, mock_get_item):
        """Test when API key not found in database."""
        mock_get_item.return_value = None

        result = get_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f6')

        assert result == {}

    @patch('src.python.transactionify.services.api_key.get_by_full_match')
    @patch('src.python.transactionify.services.api_key.is_expired')
    def test_get_api_key_expired(self, mock_is_expired, mock_get_item):
        """Test when API key is expired."""
        mock_get_item.return_value = {
            'PK': 'API_KEY#019a4757-c049-7ea8-a110-2ea110c5a6f6',
            'SK': '',
            'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7',
            'ttl': 1234567890
        }
        mock_is_expired.return_value = True

        result = get_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f6')

        assert result == {}

    @patch('src.python.transactionify.services.api_key.get_by_full_match')
    @patch('src.python.transactionify.services.api_key.is_expired')
    def test_get_api_key_no_ttl(self, mock_is_expired, mock_get_item):
        """Test when API key has no TTL (permanent key)."""
        mock_get_item.return_value = {
            'PK': 'API_KEY#019a4757-c049-7ea8-a110-2ea110c5a6f6',
            'SK': '',
            'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'
        }
        mock_is_expired.return_value = False

        result = get_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f6')

        assert result['user_id'] == '019a4757-c049-7ea8-a110-2ea110c5a6f7'

    @patch('src.python.transactionify.services.api_key.get_by_full_match')
    def test_get_api_key_returns_empty_dict_not_none(self, mock_get_item):
        """Test that function returns empty dict, not None."""
        mock_get_item.return_value = None

        result = get_api_key('test-key')

        assert result == {}
        assert result is not None
        assert isinstance(result, dict)

    @patch('src.python.transactionify.services.api_key.get_by_full_match')
    @patch('src.python.transactionify.services.api_key.is_expired')
    def test_get_api_key_creates_correct_pk(self, mock_is_expired, mock_get_item):
        """Test that function constructs the correct PK format."""
        mock_get_item.return_value = {'user_id': 'test-user'}
        mock_is_expired.return_value = False

        get_api_key('my-api-key')

        mock_get_item.assert_called_once_with(
            pk='API_KEY#my-api-key',
            sk='METADATA'
        )


class TestRegisterNewApiKey:
    """Test cases for register_new_api_key function."""

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_success(self, mock_put_item, mock_generate):
        """Test successful API key registration."""
        mock_generate.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f6'

        result = register_new_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f7')

        assert result == '019a4757-c049-7ea8-a110-2ea110c5a6f6'
        mock_put_item.assert_called_once_with(
            pk='API_KEY#019a4757-c049-7ea8-a110-2ea110c5a6f6',
            sk='METADATA',
            attributes={'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'}
        )

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_invalid_user_id(self, mock_put_item, mock_generate):
        """Test registration fails with invalid user_id format."""
        with pytest.raises(ValueError) as exc_info:
            register_new_api_key('invalid-uuid')

        assert 'Invalid user_id format' in str(exc_info.value)
        assert 'invalid-uuid' in str(exc_info.value)
        mock_generate.assert_not_called()
        mock_put_item.assert_not_called()

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_rejects_uuidv4(self, mock_put_item, mock_generate):
        """Test registration rejects UUIDv4 (must be v7)."""
        with pytest.raises(ValueError) as exc_info:
            register_new_api_key('550e8400-e29b-41d4-a716-446655440000')

        assert 'Invalid user_id format' in str(exc_info.value)
        assert 'Must be UUIDv7' in str(exc_info.value)
        mock_generate.assert_not_called()
        mock_put_item.assert_not_called()

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_empty_user_id(self, mock_put_item, mock_generate):
        """Test registration fails with empty user_id."""
        with pytest.raises(ValueError) as exc_info:
            register_new_api_key('')

        assert 'Invalid user_id format' in str(exc_info.value)
        mock_generate.assert_not_called()
        mock_put_item.assert_not_called()

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_no_ttl(self, mock_put_item, mock_generate):
        """Test that registered API keys have no TTL (permanent)."""
        mock_generate.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f6'

        register_new_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f7')

        # Verify put_item was called without TTL
        call_args = mock_put_item.call_args
        attributes = call_args[1]['attributes']
        assert 'ttl' not in attributes
        assert attributes == {'user_id': '019a4757-c049-7ea8-a110-2ea110c5a6f7'}

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_dynamodb_error(self, mock_put_item, mock_generate):
        """Test registration handles DynamoDB errors."""
        mock_generate.return_value = '019a4757-c049-7ea8-a110-2ea110c5a6f6'
        mock_put_item.side_effect = Exception('DynamoDB error')

        with pytest.raises(Exception) as exc_info:
            register_new_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f7')

        assert 'DynamoDB error' in str(exc_info.value)

    @patch('src.python.transactionify.services.api_key.generate_uuidv7')
    @patch('src.python.transactionify.services.api_key.put_item')
    def test_register_new_api_key_generates_unique_keys(self, mock_put_item, mock_generate):
        """Test that multiple registrations generate different API keys."""
        mock_generate.side_effect = [
            '019a4757-c049-7ea8-a110-2ea110c5a6f6',
            '019a4757-c049-7ea8-a110-2ea110c5a6f8',
            '019a4757-c049-7ea8-a110-2ea110c5a6f9'
        ]

        key1 = register_new_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f7')
        key2 = register_new_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f7')
        key3 = register_new_api_key('019a4757-c049-7ea8-a110-2ea110c5a6f7')

        assert key1 != key2 != key3
        assert mock_generate.call_count == 3
        assert mock_put_item.call_count == 3
