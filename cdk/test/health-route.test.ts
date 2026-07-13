import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { CdkStack } from '../lib/cdk-stack';

describe('health endpoint infrastructure', () => {
  test('creates a dedicated health Lambda function', () => {
    const app = new cdk.App({
      context: {
        stage: 'test',
      },
    });

    const stack = new CdkStack(app, 'TestStack');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
      Handler: 'index.handler',
    });
  });

  test('creates an unauthenticated GET health route', () => {
    const app = new cdk.App({
      context: {
        stage: 'test',
      },
    });

    const stack = new CdkStack(app, 'TestStack');

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /health',
    });
  });
});
