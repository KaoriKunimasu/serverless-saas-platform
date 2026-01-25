import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext('stage') ?? 'dev';
    const isProd = stage === 'prod';

    // DynamoDB
    const itemsTable = new dynamodb.Table(this, 'ItemsTable', {
      tableName: `Items-${stage}`,
      // pk: USER#{userId}, sk: ITEM#{itemId}
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: isProd },
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `project-a-users-${stage}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // Cognito Client
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });




    const commonEnv = {
  ITEMS_TABLE_NAME: itemsTable.tableName,
};

const createItemFn = new NodejsFunction(this, 'CreateItemFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  entry: path.join(__dirname, '../../apps/a-api/src/handlers/createItem.ts'),
  handler: 'handler',
  environment: commonEnv,
});

const listItemsFn = new NodejsFunction(this, 'ListItemsFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  entry: path.join(__dirname, '../../apps/a-api/src/handlers/listItems.ts'),
  handler: 'handler',
  environment: commonEnv,
});

// Grant DynamoDB permissions to Lambdas
itemsTable.grantReadWriteData(createItemFn);
itemsTable.grantReadData(listItemsFn);


const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
  apiName: `project-a-http-api-${stage}`,
});

httpApi.addRoutes({
  path: '/items',
  methods: [apigwv2.HttpMethod.POST],
  integration: new integrations.HttpLambdaIntegration('CreateItemIntegration', createItemFn),
});

httpApi.addRoutes({
  path: '/items',
  methods: [apigwv2.HttpMethod.GET],
  integration: new integrations.HttpLambdaIntegration('ListItemsIntegration', listItemsFn),
});
   new cdk.CfnOutput(this, 'HttpApiUrl', { value: httpApi.url! });



    // Outputs
    new cdk.CfnOutput(this, 'Stage', { value: stage });
    new cdk.CfnOutput(this, 'ItemsTableName', { value: itemsTable.tableName });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ItemsTableArn', { value: itemsTable.tableArn });
 

  }
}
