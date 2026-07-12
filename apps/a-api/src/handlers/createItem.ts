import { randomUUID } from 'crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

import { ddb, TABLE_NAME } from '../lib/ddb';
import {
  badRequest,
  internalServerError,
  ok,
  unauthorized,
} from '../lib/response';
import { log } from '../lib/logger';
import { getAuthenticatedUserId } from '../lib/auth';

const schema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
});

/**
 * Expected event shape:
 * - event.body: JSON string or object
 * - event.requestContext.authorizer.jwt.claims.sub: authenticated user ID
 */
export const handler = async (event: any) => {
  log('createItem.requestReceived', {
    hasBody: Boolean(event?.body),
    bodyType: typeof event?.body,
    hasJwtClaims: Boolean(
      event?.requestContext?.authorizer?.jwt?.claims?.sub,
    ),
  });

  if (!event?.body) {
    return badRequest('Missing body');
  }

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

  if (!parsed.success) {
    return badRequest('Invalid input');
  }

  const userId = getAuthenticatedUserId(event);

  if (!userId) {
    return unauthorized();
  }

  const item = {
    pk: `USER#${userId}`,
    sk: `ITEM#${randomUUID()}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }),
    );
  } catch (error) {
    log('createItem.dynamodbWriteFailed', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });

    return internalServerError();
  }

  log('createItem.created', {
    userId,
    itemId: item.sk,
  });

  return ok(item);
};
