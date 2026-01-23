import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../lib/ddb';
import { ok } from '../lib/response';
import { log } from '../lib/logger';

export const handler = async (event: any) => {
  const userId = event.requestContext?.authorizer?.claims?.sub ?? 'local-user';

  const pk = `USER#${userId}`;

  const result = await ddb.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
    ExpressionAttributeValues: {
      ':pk': pk,
      ':sk': 'ITEM#',
    },
  }));

  log('listItems', { count: result.Count });

  return ok(result.Items ?? []);
};
