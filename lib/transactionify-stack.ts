#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigwv2_authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class TransactionifyStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Apply tags to all resources in this stack
        cdk.Tags.of(this).add('finops:Project', 'Transactionify');
        cdk.Tags.of(this).add('finops:Service', 'Transactionify API');
        cdk.Tags.of(this).add('finops:Team', 'Platform');
        cdk.Tags.of(this).add('finops:Owner', 'ruy.garcia');
        cdk.Tags.of(this).add('project-type', 'api')
        cdk.Tags.of(this).add('infrastructure', 'cdk');

        // DynamoDB table for single table pattern
        const table = new dynamodb.Table(this, 'DynamoDBTable', {
            tableName: `${cdk.Stack.of(this).stackName}-table`,
            partitionKey: {
                name: 'PK',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'SK',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            timeToLiveAttribute: 'ttl',
        });

        // API Gateway v2 (HTTP API)
        const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
            apiName: `${cdk.Stack.of(this).stackName}-api`,
            createDefaultStage: true,
        });

        const authorizerLambda = new lambda.Function(this, 'AuthorizerLambda', {
            functionName: `${cdk.Stack.of(this).stackName}-authorizer`,
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'transactionify.handlers.authorizer.main.handler',
            code: lambda.Code.fromAsset('src/python'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        // Grant read permissions to authorizer Lambda
        table.grantReadData(authorizerLambda);

        const authorizer = new apigwv2_authorizers.HttpLambdaAuthorizer('LambdaAuthorizer', authorizerLambda, {
            identitySource: ['$request.header.Authorization'],
            resultsCacheTtl: cdk.Duration.minutes(0),
            responseTypes: [apigwv2_authorizers.HttpLambdaResponseType.SIMPLE],
        });

        const provisioningLambda = new lambda.Function(this, 'ProvisioningLambda', {
            description: 'Registers a new user by generating a new API Key. This is NOT to be exposed as an API endpoint.',
            functionName: `${cdk.Stack.of(this).stackName}-provisioning`,
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'transactionify.handlers.provisioning.main.handler',
            code: lambda.Code.fromAsset('src/python'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        // Grant write permissions to provisioning Lambda
        table.grantWriteData(provisioningLambda);

        // Lambda function for creating new Account
        const createAccountLambda = new lambda.Function(this, 'CreateAccountLambda', {
            description: 'Creates a new account for the authenticated user',
            functionName: `${cdk.Stack.of(this).stackName}-create-account`,
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'transactionify.handlers.api.rest.account.create.main.handler',
            code: lambda.Code.fromAsset('src/python'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        // Grant read/write permissions to create account Lambda
        table.grantReadWriteData(createAccountLambda);

        // Create new Account
        const createAccountIntegration = new apigwv2_integrations.HttpLambdaIntegration('CreateAccountIntegration', createAccountLambda);
        httpApi.addRoutes({
            path: '/api/v1/accounts',
            methods: [apigwv2.HttpMethod.POST],
            integration: createAccountIntegration,
            authorizer: authorizer,
        });

        // Lambda function for creating new Payment
        const createPaymentLambda = new lambda.Function(this, 'CreatePaymentLambda', {
            description: 'Creates a new payment for an account',
            functionName: `${cdk.Stack.of(this).stackName}-create-payment`,
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'transactionify.handlers.api.rest.payment.create.main.handler',
            code: lambda.Code.fromAsset('src/python'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        // Grant read/write permissions to create payment Lambda
        table.grantReadWriteData(createPaymentLambda);

        // Create new Payment
        const createPaymentIntegration = new apigwv2_integrations.HttpLambdaIntegration('CreatePaymentIntegration', createPaymentLambda);
        httpApi.addRoutes({
            path: '/api/v1/accounts/{account_id}/payments',
            methods: [apigwv2.HttpMethod.POST],
            integration: createPaymentIntegration,
            authorizer: authorizer,
        });

        // Lambda function for getting account balance
        const getBalanceLambda = new lambda.Function(this, 'GetBalanceLambda', {
            description: 'Gets the balance for an account',
            functionName: `${cdk.Stack.of(this).stackName}-get-balance`,
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'transactionify.handlers.api.rest.balance.get.main.handler',
            code: lambda.Code.fromAsset('src/python'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        // Grant read permissions to get balance Lambda
        table.grantReadData(getBalanceLambda);

        // Get Balance
        const getBalanceIntegration = new apigwv2_integrations.HttpLambdaIntegration('GetBalanceIntegration', getBalanceLambda);
        httpApi.addRoutes({
            path: '/api/v1/accounts/{account_id}/balance',
            methods: [apigwv2.HttpMethod.GET],
            integration: getBalanceIntegration,
            authorizer: authorizer,
        });

        // Lambda function for listing account transactions
        const listTransactionsLambda = new lambda.Function(this, 'ListTransactionsLambda', {
            description: 'Lists all transactions for an account',
            functionName: `${cdk.Stack.of(this).stackName}-list-transactions`,
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'transactionify.handlers.api.rest.transaction.list.main.handler',
            code: lambda.Code.fromAsset('src/python'),
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        // Grant read permissions to list transactions Lambda
        table.grantReadData(listTransactionsLambda);

        // List Transactions
        const listTransactionsIntegration = new apigwv2_integrations.HttpLambdaIntegration('ListTransactionsIntegration', listTransactionsLambda);
        httpApi.addRoutes({
            path: '/api/v1/accounts/{account_id}/transactions',
            methods: [apigwv2.HttpMethod.GET],
            integration: listTransactionsIntegration,
            authorizer: authorizer,
        });

        // Output the API Gateway URL
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: httpApi.apiEndpoint,
            description: 'HTTP API Gateway endpoint URL',
            exportName: `${cdk.Stack.of(this).stackName}-api-url`,
        });

        // Output the DynamoDB table name
        new cdk.CfnOutput(this, 'TableName', {
            value: table.tableName,
            description: 'DynamoDB table name',
            exportName: `${cdk.Stack.of(this).stackName}-table-name`,
        });
    }
}
