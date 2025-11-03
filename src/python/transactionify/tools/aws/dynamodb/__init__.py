import os
import boto3
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

# Initialize DynamoDB client and table
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
table = dynamodb.Table(TABLE_NAME) if TABLE_NAME else None


def get_by_full_match(pk: str, sk: str = '') -> Optional[Dict[str, Any]]:
    """
    Get an item from DynamoDB by exact PK and SK match.

    Args:
        pk: Partition key value
        sk: Sort key value (defaults to empty string)

    Returns:
        Item dict if found, None otherwise
    """
    if not table:
        raise ValueError("TABLE_NAME environment variable not set")

    try:
        response = table.get_item(
            Key={
                'PK': pk,
                'SK': sk
            }
        )
        return response.get('Item')
    except Exception as e:
        print(f"Error getting item from DynamoDB: {str(e)}")
        raise


def put_item(pk: str, sk: str, attributes: Dict[str, Any]) -> Dict[str, Any]:
    """
    Put an item into DynamoDB.

    Args:
        pk: Partition key value
        sk: Sort key value
        attributes: Additional attributes to store

    Returns:
        Response from DynamoDB put_item operation
    """
    if not table:
        raise ValueError("TABLE_NAME environment variable not set")

    try:
        item = {
            'PK': pk,
            'SK': sk,
            **attributes
        }

        response = table.put_item(Item=item)
        return response
    except Exception as e:
        print(f"Error putting item to DynamoDB: {str(e)}")
        raise


def query_by_pk(pk: str, sk_prefix: Optional[str] = None, limit: Optional[int] = None) -> list:
    """
    Query items by partition key and optional sort key prefix.

    Args:
        pk: Partition key value
        sk_prefix: Optional sort key prefix to filter results
        limit: Optional limit on number of items to return

    Returns:
        List of items matching the query
    """
    if not table:
        raise ValueError("TABLE_NAME environment variable not set")

    try:
        query_params = {
            'KeyConditionExpression': 'PK = :pk'
        }

        expression_values = {':pk': pk}

        if sk_prefix:
            query_params['KeyConditionExpression'] += ' AND begins_with(SK, :sk_prefix)'
            expression_values[':sk_prefix'] = sk_prefix

        query_params['ExpressionAttributeValues'] = expression_values

        if limit:
            query_params['Limit'] = limit

        response = table.query(**query_params)
        return response.get('Items', [])
    except Exception as e:
        print(f"Error querying DynamoDB: {str(e)}")
        raise


def is_expired(item: Dict[str, Any]) -> bool:
    """
    Check if an item has expired based on its TTL attribute.

    Args:
        item: DynamoDB item with optional 'ttl' attribute

    Returns:
        True if expired, False otherwise
    """
    ttl = item.get('ttl')
    if not ttl:
        return False

    current_time = int(datetime.utcnow().timestamp())
    return current_time > ttl


def get_ttl_2_weeks() -> int:
    """
    Calculate TTL timestamp for 2 weeks from now.

    Returns:
        Unix timestamp for 2 weeks from now
    """
    two_weeks = datetime.utcnow() + timedelta(weeks=2)
    return int(two_weeks.timestamp())
