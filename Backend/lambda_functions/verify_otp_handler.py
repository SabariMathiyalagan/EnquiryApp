import json
import boto3
import hashlib
import os
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')

# Environment variables
OTP_TABLE = os.environ.get('OTP_TABLE')

def lambda_handler(event, context):
    """
    Lambda handler for POST /verify
    
    Expected event body:
    {
        "requestId": "uuid-string",
        "otp": "1234"
    }
    
    Returns:
    {
        "ok": true
    }
    """
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,x-api-key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        request_id = body.get('requestId', '').strip()
        otp = body.get('otp', '').strip()
        print(f"Request ID: {request_id}, OTP: {otp}")
        
        
        # Validate required fields
        if not request_id or not otp:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        # Get item from DynamoDB
        table = dynamodb.Table(OTP_TABLE)
        
        try:
            response = table.get_item(
                Key={
                    'PK': f'OTP#{request_id}'
                }
            )
        except Exception as e:
            print(f"DynamoDB get error: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'Failed to retrieve OTP'})
            }
        
        # Check if item exists
        if 'Item' not in response:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'OTP not found or already used'})
            }
        
        item = response['Item']
        
        # Check if OTP has expired
        import time
        current_time = int(time.time())
        expires_at = int(item.get('expiresAt', 0))
        
        if expires_at <= current_time:
            # Delete expired OTP
            try:
                table.delete_item(Key={'PK': f'OTP#{request_id}'})
            except Exception as e:
                print(f"Failed to delete expired OTP: {str(e)}")
            
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'OTP has expired'})
            }
        
        # Verify OTP
        stored_salt = item.get('otp_salt', '')
        print(f"Stored salt: {stored_salt}")
        stored_hash = item.get('otp_hash', '')
        
        computed_hash = hashlib.sha256((stored_salt + otp).encode()).hexdigest()
        print(f"Computed hash: {computed_hash}, Stored hash: {stored_hash}")
        
        if computed_hash != stored_hash:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid OTP code'})
            }
        
        # OTP is valid, delete the item to prevent reuse
        try:
            table.delete_item(
                Key={
                    'PK': f'OTP#{request_id}'
                }
            )
        except Exception as e:
            print(f"DynamoDB delete error: {str(e)}")
            # Don't fail the request if delete fails
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'ok': True})
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }


