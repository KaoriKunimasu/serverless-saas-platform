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
 * - event.requestContext.requestId: API Gateway request identifier
 * - event.requestContext.authorizer.jwt.claims.sub: authenticated user ID
 */
export const handler = async (event: any) => {
  const requestId = event?.requestContext?.requestId ?? 'unknown';
  const method = event?.requestContext?.http?.method ?? 'unknown';
  const path = event?.rawPath ?? 'unknown';

  log('createItem.requestReceived', {
    requestId,
    method,
    path,
    hasBody: Boolean(event?.body),
    bodyType: typeof event?.body,
    hasAuthenticatedUser: Boolean(
      event?.requestContext?.authorizer?.jwt?.claims?.sub,
    ),
  });

  if (!event?.body) {
    log('createItem.requestRejected', {
      requestId,
      reason: 'missing_body',
      statusCode: 400,
    });

    return badRequest('Missing body');
  }

  let bodyObj: unknown;

  if (typeof event.body === 'string') {
    try {
      bodyObj = JSON.parse(event.body);
    } catch {
      log('createItem.requestRejected', {
        requestId,
        reason: 'invalid_json',
        statusCode: 400,
      });

      return badRequest('Invalid JSON');
    }
  } else {
    bodyObj = event.body;
  }

  const parsed = schema.safeParse(bodyObj);

  if (!parsed.success) {
    log('createItem.requestRejected', {
      requestId,
      reason: 'invalid_input',
      statusCode: 400,
    });

    return badRequest('Invalid input');
  }

  const userId = getAuthenticatedUserId(event);

  if (!userId) {
    log('createItem.requestRejected', {
      requestId,
      reason: 'missing_authenticated_user',
      statusCode: 401,
    });

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
      requestId,
      statusCode: 500,
      errorCategory: 'dynamodb_write_failure',
      errorName: error instanceof Error ? error.name : 'UnknownError',
    });

    return internalServerError();
  }

  log('createItem.created', {
    requestId,
    statusCode: 200,
    itemId: item.sk,
  });

  return ok(item);
};
