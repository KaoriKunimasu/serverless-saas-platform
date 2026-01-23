import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../lib/ddb';
import { ok, badRequest } from '../lib/response';
import { z } from 'zod';
import { log } from '../lib/logger';

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
});

export const handler = async (event: any) => {
  if (!event.body) return badRequest('Missing body');

  const parsed = schema.safeParse(JSON.parse(event.body));
  if (!parsed.success) return badRequest('Invalid input');

  const userId = event.requestContext?.authorizer?.claims?.sub ?? 'local-user';
  const itemId = crypto.randomUUID();

  const item = {
    pk: `USER#${userId}`,
    sk: `ITEM#${itemId}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  log('createItem', item);

  await ddb.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  }));

  return ok(item);
};
