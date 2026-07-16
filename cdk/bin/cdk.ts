#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

const stage = app.node.tryGetContext('stage') ?? 'dev';

// Applied to every taggable resource in the stack.
cdk.Tags.of(app).add('project', 'project-a');
cdk.Tags.of(app).add('stage', stage);
cdk.Tags.of(app).add('owner', 'KaoriKunimasu');

new CdkStack(app, 'CdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
