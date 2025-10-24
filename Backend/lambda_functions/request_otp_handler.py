import json
import boto3
import hashlib
import secrets
import uuid
import os
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Environment variables
OTP_TABLE = os.environ.get('OTP_TABLE')
OTP_TTL_SECONDS = int(os.environ.get('OTP_TTL_SECONDS', '300'))

def lambda_handler(event, context):
    """
    Lambda handler for POST /request
    
    Expected event body:
    {
        "phone": "+11234567890"
    }
    
    Returns:
    {
        "requestId": "uuid-string"
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
        
        phone = body.get('phone', '').strip()
        
        # Validate phone number (E.164 format)
        if not phone or not phone.startswith('+') or len(phone) < 8 or len(phone) > 16:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid phone format. Expected E.164 format (e.g., +11234567890)'})
            }
        
        # Generate 4-digit OTP
        otp_code = str(secrets.randbelow(10000)).zfill(4)
        
        # Generate salt and hash
        salt = secrets.token_hex(16)
        otp_hash = hashlib.sha256((salt + otp_code).encode()).hexdigest()
        
        # Generate request ID
        request_id = str(uuid.uuid4())
        
        # Calculate expiration time (current timestamp + TTL)
        import time
        current_time = int(time.time())
        expires_at = current_time + OTP_TTL_SECONDS
        
        # Store in DynamoDB
        table = dynamodb.Table(OTP_TABLE)
        
        try:
            table.put_item(
                Item={
                    'PK': f'OTP#{request_id}',
                    'phone': phone,
                    'otp_salt': salt,
                    'otp_hash': otp_hash,
                    'expiresAt': Decimal(str(expires_at)),
                    'TTL': Decimal(str(expires_at)),
                    'createdAt': Decimal(str(current_time))
                }
            )
        except Exception as e:
            print(f"DynamoDB put error: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'Failed to store OTP'})
            }
        
        # Send SMS via SNS
        try:
            message = f"Your UCMAS verification code is {otp_code}. It expires in {OTP_TTL_SECONDS // 60} minutes."
            
            sns.publish(
                PhoneNumber=phone,
                Message=message,
                MessageAttributes={
                    'AWS.SNS.SMS.SMSType': {
                        'DataType': 'String',
                        'StringValue': 'Transactional'
                    }
                }
            )
        except Exception as e:
            # Log error but don't fail the request (OTP is already stored)
            print(f"SMS send failed: {str(e)}")
            # In production, you might want to return an error here
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'requestId': request_id})
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


