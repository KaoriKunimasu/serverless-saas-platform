import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

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
      authFlows: { userPassword: true, userSrp: true },
    });

    // Lambdas
    const commonEnv = {
    ITEMS_TABLE_NAME: itemsTable.tableName,
    STAGE: stage,
    };

    const createItemFn = new NodejsFunction(this, 'CreateItemFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../apps/a-api/src/handlers/createItem.ts'),
      handler: 'handler',
      environment: commonEnv,

      depsLockFilePath: path.join(__dirname, '../../apps/a-api/package-lock.json'),

      });

    const listItemsFn = new NodejsFunction(this, 'ListItemsFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../../apps/a-api/src/handlers/listItems.ts'),
      handler: 'handler',
      environment: commonEnv,
      depsLockFilePath: path.join(__dirname, '../../apps/a-api/package-lock.json'),

    });

const summaryFn = new NodejsFunction(this, 'SummaryFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  entry: path.join(__dirname, '../../apps/a-api/src/handlers/summary.ts'),
  handler: 'handler',
  environment: {
    ...commonEnv,
    STAGE: stage,
    SUMMARY_FROM_EMAIL: 'kaori.kunimasu@gmail.com',
    SUMMARY_TO_EMAIL: 'kaori.kunimasu@gmail.com',
  },
  depsLockFilePath: path.join(__dirname, '../../apps/a-api/package-lock.json'),
});

  itemsTable.grantReadData(summaryFn);

  summaryFn.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    resources: ['*'],
  })
);

// EventBridge schedule (dev: every 5 min, prod: daily)
const schedule = isProd
  ? events.Schedule.cron({ minute: '0', hour: '0' }) // UTC 00:00（= JST 09:00）
  : events.Schedule.rate(cdk.Duration.minutes(5));

const summaryScheduleRule = new events.Rule(this, 'SummaryScheduleRule', {
  ruleName: `project-a-summary-${isProd ? 'daily' : 'every5min'}-${stage}`,
  schedule,
});

// Invoke Summary Lambda on schedule
summaryScheduleRule.addTarget(
  new targets.LambdaFunction(summaryFn, {
    event: events.RuleTargetInput.fromObject({
      userId: isProd ? 'system' : '19eeb488-80f1-707a-0833-37e691495dc9',
      source: 'eventbridge',
      stage,
    }),
  })
);

    // Grant DynamoDB permissions to Lambdas
    itemsTable.grantReadWriteData(createItemFn);
    itemsTable.grantReadData(listItemsFn);

    // HTTP API
    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: `project-a-http-api-${stage}`,
      corsPreflight: {
        allowOrigins: [
          'http://localhost:3000',
          'https://dkpxahwdysmia.cloudfront.net',
        ],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['authorization', 'content-type'],
      },
    });

    // JWT Authorizer (Cognito)
    const issuer = `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`;
    const jwtAuthorizer = new authorizers.HttpJwtAuthorizer('JwtAuthorizer', issuer, {
      jwtAudience: [userPoolClient.userPoolClientId],
    });

    // Routes (protected)
    httpApi.addRoutes({
      path: '/items',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('CreateItemIntegration', createItemFn),
      authorizer: jwtAuthorizer,
    });

    httpApi.addRoutes({
      path: '/items',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('ListItemsIntegration', listItemsFn),
      authorizer: jwtAuthorizer,
    });

    httpApi.addRoutes({
      path: '/summary',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('SummaryIntegration', summaryFn),
      authorizer: jwtAuthorizer,
    });

    // Outputs
    new cdk.CfnOutput(this, 'HttpApiUrl', { value: httpApi.url! });
    new cdk.CfnOutput(this, 'Stage', { value: stage });
    new cdk.CfnOutput(this, 'ItemsTableName', { value: itemsTable.tableName });
    new cdk.CfnOutput(this, 'ItemsTableArn', { value: itemsTable.tableArn });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });

    // --- Frontend hosting (S3 + CloudFront) ---
    // Build output: apps/a-web/out
    const webBucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: `project-a-web-${stage}-${this.account}-${this.region}`.toLowerCase(),
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: isProd ? false : true,
    });

    const oac = new cloudfront.S3OriginAccessControl(this, 'WebOac', {
      originAccessControlName: `project-a-web-oac-${stage}`,
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(webBucket, {
      originAccessControl: oac,
    });

    const distribution = new cloudfront.Distribution(this, 'WebDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });




    webBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [webBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    // Deploy static assets
    new s3deploy.BucketDeployment(this, 'WebDeploy', {
      destinationBucket: webBucket,
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../apps/a-web/out'))],
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
      }
    
    }


