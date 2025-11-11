import json
import boto3
import uuid
import os
from datetime import datetime, timezone
from decimal import Decimal
import gspread


# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')

# Environment variables
ENQUIRY_TABLE = os.environ.get('ENQUIRY_TABLE')

_cached_client = None

def lambda_handler(event, context):
    """
    Lambda handler for POST /submit
    
    Expected event body:
    {
        "children": [
            {
                "id": "1",
                "name": "John Doe",
                "age": "8",
                "selectedCourse": "ucmas"
            }
        ],
        "parentName": "Jane Doe",
        "contactNumber": "123-456-7890",
        "email": "jane@example.com",
        "consent": true,
        "todaysDate": "10/23/2025"
    }
    
    Returns:
    {
        "success": true,
        "enquiryId": "uuid-string"
    }
    """

    def get_gspread_client():
        global _cached_client
        if _cached_client is None:
            response = boto3.client('secretsmanager').get_secret_value(SecretId=os.environ.get('GOOGLE_SHEETS_SECRET'))
            secret_dict = json.loads(response['SecretString'])
            _cached_client = gspread.service_account_from_dict(
            info=secret_dict
        )
        return _cached_client
    
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
        
        # Extract form data
        children = body.get('children', [])
        parent_name = body.get('parentName', '').strip()
        contact_number = body.get('contactNumber', '').strip()
        email = body.get('email', '').strip()
        consent = body.get('consent', False)
        todays_date = body.get('todaysDate', '')
        
        # Validate required fields
        if not children or len(children) == 0:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'At least one child is required'})
            }
        
        if not parent_name:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Parent name is required'})
            }
        
        if not contact_number:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Contact number is required'})
            }
        
        if not consent:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Consent is required'})
            }
        
        # Validate at least one child has required fields
        valid_child = False
        for child in children:
            if child.get('name', '').strip() and child.get('age', '').strip() and child.get('selectedCourse', '').strip():
                valid_child = True
                break
        
        if not valid_child:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'At least one child must have name, age, and course selected'})
            }
        
        # Generate enquiry ID
        enquiry_id = str(uuid.uuid4())
        
        # Get current timestamp
        submitted_at = datetime.now(timezone.utc).isoformat()
        
        # Store in DynamoDB
        table = dynamodb.Table(ENQUIRY_TABLE)
        
        # Format children data for Google Sheets (as JSON string or concatenated)
        children_info = " | ".join([
            f"{child.get('name', 'N/A')} (Age: {child.get('age', 'N/A')}, Course: {child.get('selectedCourse', 'N/A')})"
            for child in children
        ])
        
        try:
            # Write to Google Sheets
            try:
                client = get_gspread_client()
                sheet = client.open_by_key(os.environ.get('SHEET_ID'))
                worksheet = sheet.worksheet('Sheet1')
                
                # Append row with all data including children info
                worksheet.append_row([
                    enquiry_id,
                    parent_name,
                    contact_number,
                    email if email else '',
                    str(consent),
                    todays_date,
                    children_info,  # Add children information
                    submitted_at,
                    'pending'
                ])
                print(f"Successfully wrote to Google Sheets: {enquiry_id}")
            except Exception as sheets_error:
                # Log error but don't fail the request - DynamoDB is the source of truth
                print(f"Google Sheets write error: {str(sheets_error)}")
                print("Continuing with DynamoDB storage...")
            
            # Write to DynamoDB (primary storage)
            table.put_item(
                Item={
                    'PK': f'ENQUIRY#{enquiry_id}',
                    'enquiryId': enquiry_id,
                    'children': children,
                    'parentName': parent_name,
                    'contactNumber': contact_number,
                    'email': email if email else None,
                    'consent': consent,
                    'formDate': todays_date,
                    'submittedAt': submitted_at,
                    'status': 'pending'
                }
            )
            print(f"Successfully wrote to DynamoDB: {enquiry_id}")
        except Exception as e:
            print(f"DynamoDB put error: {str(e)}")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'Failed to store enquiry'})
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'enquiryId': enquiry_id
            })
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


