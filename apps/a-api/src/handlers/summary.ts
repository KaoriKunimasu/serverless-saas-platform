import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../lib/ddb';
import { ok } from '../lib/response';
import { log } from '../lib/logger';
import { getUserId } from '../lib/auth';

type Item = {
  pk: string;
  sk: string;
  amount?: number;
  createdAt?: string;
};

function monthKey(iso?: string) {
  if (!iso) return 'unknown';
  // "2026-01-25T..." -> "2026-01"
  return iso.slice(0, 7);
}

export const handler = async (event: any) => {
    log('summary.debug.event', {
  hasUserId: typeof event?.userId !== 'undefined',
  userId: event?.userId,
  keys: event ? Object.keys(event) : [],
});

const sub =
  event?.requestContext?.authorizer?.jwt?.claims?.sub ??
  event?.requestContext?.authorizer?.claims?.sub; // fallback

  const userId = getUserId(event);

  const pk = `USER#${userId}`;

  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': pk,
        ':sk': 'ITEM#',
      },
    })
  );

  const items = (result.Items ?? []) as Item[];

  let count = 0;
  let totalAmount = 0;
  const monthlyTotals: Record<string, number> = {};

  for (const it of items as any[]) {
    count += 1;
    const amt = typeof it.amount === 'number' ? it.amount : 0;
    totalAmount += amt;

    const m = it.createdAt ? it.createdAt.slice(0, 7) : 'unknown';
    monthlyTotals[m] = (monthlyTotals[m] ?? 0) + amt;
  }

const responsePayload = {
  userId,
  count,
  totalAmount,
  monthlyTotals,
  generatedAt: new Date().toISOString(),
};

log('summary.generated', responsePayload);

// HTTP API
if (event?.requestContext) {
  return ok(responsePayload);
}

// EventBridge / AWS Lambda Invoke
return responsePayload;
};