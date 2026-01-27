import { randomUUID } from 'crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../lib/ddb';
import { ok, badRequest } from '../lib/response';
import { z } from 'zod';
import { log } from '../lib/logger';
import { getUserId } from '../lib/auth';

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
});

/**
 * Expected event (API Gateway v2 HTTP API proxy-like shape):
 * - event.body: string (JSON) or object
 * - event.requestContext.authorizer.jwt.claims.sub: string (new format)
 * - event.requestContext.authorizer.claims.sub: string (older format)
 */
export const handler = async (event: any) => {
  log('rawEvent', {
    hasBody: !!event?.body,
    bodyType: typeof event?.body,
    bodyPreview: typeof event?.body === 'string' ? event.body.slice(0, 200) : event?.body,
    isBase64Encoded: event?.isBase64Encoded,
    keys: Object.keys(event ?? {}),
  });

  if (!event?.body) return badRequest('Missing body');

  let bodyObj: unknown;

  if (typeof event.body === 'string') {
    try {
      bodyObj = JSON.parse(event.body);
    } catch {
      return badRequest('Invalid JSON');
    }
  } else {
    bodyObj = event.body;
  }

  const parsed = schema.safeParse(bodyObj);
  if (!parsed.success) return badRequest('Invalid input');

  const userId = getUserId(event);
  const itemId = randomUUID();

  const item = {
    pk: `USER#${userId}`,
    sk: `ITEM#${itemId}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  log('createItem', item);

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return ok(item);
};
