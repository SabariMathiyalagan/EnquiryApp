from aws_cdk import (
    # Duration,
    Stack,
    # aws_sqs as sqs,
    aws_dynamodb as ddb,
    aws_lambda as lambda_,
    aws_apigateway as apigw,
    RemovalPolicy,
    aws_sns as sns,
    aws_iam as iam,
)
from constructs import Construct

class BackendStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        otp_table = ddb.Table(
            self, "OtpTable",
            partition_key=ddb.Attribute(name="PK", type=ddb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY,
            time_to_live_attribute="TTL",
            billing_mode=ddb.BillingMode.PAY_PER_REQUEST,
            point_in_time_recovery=True,
            table_name="OtpTable",
        )

        enquiry_table = ddb.Table(
            self, "EnquiryTable",
            partition_key=ddb.Attribute(name="PK", type=ddb.AttributeType.STRING),
            removal_policy=RemovalPolicy.DESTROY,
            time_to_live_attribute="TTL",
            billing_mode=ddb.BillingMode.PAY_PER_REQUEST,
            point_in_time_recovery=True,
            table_name="EnquiryTable",
        )
        common_env = {
            "OTP_TABLE": otp_table.table_name,
            "ENQUIRY_TABLE": enquiry_table.table_name,
            "OTP_TTL_SECONDS": "300",
        }

        request_otp_lambda = lambda_.Function(
            self, "RequestOtpLambda",
            function_name="RequestOtpLambda",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="request_otp_handler.lambda_handler",
            code=lambda_.Code.from_asset("./lambda_functions"),
            environment=common_env,
        )

        verify_otp_lambda = lambda_.Function(
            self, "VerifyOtpLambda",
            function_name="VerifyOtpLambda",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="verify_otp_handler.lambda_handler",
            code=lambda_.Code.from_asset("./lambda_functions"),
            environment=common_env,
        )

        submit_enquiry_lambda = lambda_.Function(
            self, "SubmitEnquiryLambda",
            function_name="SubmitEnquiryLambda",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="submit_enquiry_handler.lambda_handler",
            code=lambda_.Code.from_asset("./lambda_functions"),
            environment=common_env,
        )
        api_gateway = apigw.RestApi(
            self, "BackendApiGateway",
            rest_api_name="BackendApiGateway",
            description="API Gateway for the backend",
            deploy_options=apigw.StageOptions(
                stage_name="v1",
            ),
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS,
                allow_headers=apigw.Cors.DEFAULT_HEADERS,
            ),
        )
        request_otp_resource = api_gateway.root.add_resource("request")
        verify_otp_resource = api_gateway.root.add_resource("verify")
        submit_enquiry_resource = api_gateway.root.add_resource("submit")
        request_otp_method = request_otp_resource.add_method("POST", integration=apigw.LambdaIntegration(request_otp_lambda), api_key_required=True)
        verify_otp_method = verify_otp_resource.add_method("POST", integration=apigw.LambdaIntegration(verify_otp_lambda), api_key_required=True)
        submit_enquiry_method = submit_enquiry_resource.add_method("POST", integration=apigw.LambdaIntegration(submit_enquiry_lambda), api_key_required=True)



        otp_table.grant_read_write_data(request_otp_lambda)
        otp_table.grant_read_write_data(verify_otp_lambda)
        enquiry_table.grant_read_write_data(submit_enquiry_lambda)
        
        # Grant permission to publish SMS directly to phone numbers
        request_otp_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["sns:Publish"],
                resources=["*"],  # Required for direct SMS publishing to phone numbers
            )
        )



        api_key = api_gateway.add_api_key("BackendApiKey", description="API Key for the backend")
        plan = api_gateway.add_usage_plan(
            "BackendUsagePlan",
            name="BackendUsagePlan",
            throttle=apigw.ThrottleSettings(rate_limit=100, burst_limit=100),
        )
        plan.add_api_key(api_key)
        plan.add_api_stage(stage=api_gateway.deployment_stage)



