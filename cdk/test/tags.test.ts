import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { CdkStack } from '../lib/cdk-stack';

// The app-level tags live in bin/cdk.ts, so apply them the same way here
// rather than importing the entry point.
function stackWithAppTags(stage: string) {
  const app = new cdk.App({ context: { stage } });

  cdk.Tags.of(app).add('project', 'project-a');
  cdk.Tags.of(app).add('stage', stage);
  cdk.Tags.of(app).add('owner', 'KaoriKunimasu');

  return new CdkStack(app, 'TestStack');
}

describe('resource tagging', () => {
  test('tags every taggable resource with project, stage and owner', () => {
    const template = Template.fromStack(stackWithAppTags('test'));

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      Tags: [
        { Key: 'owner', Value: 'KaoriKunimasu' },
        { Key: 'project', Value: 'project-a' },
        { Key: 'stage', Value: 'test' },
      ],
    });
  });

  test('the stage tag follows the stage context', () => {
    const template = Template.fromStack(stackWithAppTags('prod'));

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      Tags: Match.arrayWith([{ Key: 'stage', Value: 'prod' }]),
    });
  });
});
