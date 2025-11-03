# Test Suite

This directory contains the test suite for the Transactionify project.

## Structure

```
test/
├── unit/
│   └── src/
│       └── python/
│           ├── handlers/
│           │   └── test_authorizer.py      # Tests for Lambda authorizer
│           └── tools/
│               └── validators/
│                   └── test_uuid.py        # Tests for UUID validation
```

## Running Tests

### Quick Start

```bash
# Install production dependencies
cd src/python
pip install -r requirements.txt

# Install testing dependencies
cd ../../test/unit/src/python
pip install -r requirements.txt

# Run all tests (from test/unit/src/python directory)
pytest

# Run with coverage
pytest --cov=src/python/transactionify --cov-report=html
```

**Note**: All pytest commands should be run from the `test/unit/src/python/` directory where `pytest.ini` is located.

### Test Files

#### test_authorizer.py
Tests for the Lambda authorizer handler (`src/python/transactionify/handlers/authorizer/main.py`):
- **TestAuthorizerHandler**: Integration tests for the handler function
  - Authorization header validation
  - UUIDv7 format validation
  - API key lookup and validation
  - Context passing to downstream handlers
  - Error handling

- **TestExtractApiKey**: Unit tests for API key extraction
  - Header parsing (case-insensitive)
  - Whitespace handling
  - No Bearer prefix support

- **TestValidateApiKey**: Unit tests for API key validation
  - DynamoDB lookup
  - TTL expiration checking
  - Error handling

#### test_uuid.py
Tests for the UUID validator (`src/python/transactionify/tools/validators/uuid.py`):
- **TestIsValidUuidv7**: Comprehensive UUID validation tests
  - Valid UUIDv7 formats
  - Invalid versions (v1, v4, etc.)
  - Invalid variants
  - Format validation (hyphens, length, characters)
  - Case-insensitivity
  - Edge cases (empty, None, whitespace)

## Coverage

To generate a coverage report:

```bash
pytest --cov=src/python/transactionify --cov-report=html
open htmlcov/index.html
```

## Writing Tests

### Test Naming Convention
- Test files: `test_*.py`
- Test classes: `Test*`
- Test functions: `test_*`

### Example Test

```python
import pytest
from unittest.mock import patch

class TestMyFunction:
    """Test cases for my_function."""
    
    def test_success_case(self):
        """Test successful execution."""
        result = my_function('input')
        assert result == 'expected'
    
    @patch('module.dependency')
    def test_with_mock(self, mock_dep):
        """Test with mocked dependency."""
        mock_dep.return_value = 'mocked'
        result = my_function()
        assert result == 'expected'
```

## Mocking AWS Services

Use `moto` for mocking AWS services:

```python
import boto3
from moto import mock_dynamodb

@mock_dynamodb
def test_with_dynamodb():
    """Test with mocked DynamoDB."""
    # Create mock table
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    table = dynamodb.create_table(
        TableName='test-table',
        KeySchema=[
            {'AttributeName': 'PK', 'KeyType': 'HASH'},
            {'AttributeName': 'SK', 'KeyType': 'RANGE'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'PK', 'AttributeType': 'S'},
            {'AttributeName': 'SK', 'AttributeType': 'S'}
        ],
        BillingMode='PAY_PER_REQUEST'
    )
    
    # Run your test
    # ...
```
