import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddb, TABLE_NAME } from '../lib/ddb';
import { ok } from '../lib/response';
import { log } from '../lib/logger';
import { getUserId } from '../lib/auth';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

type Item = {
  pk: string;
  sk: string;
  amount?: number;
  createdAt?: string;
};

export const handler = async (event: any) => {
  const stage =
    event?.stage ??
    event?.detail?.stage ??
    process.env.STAGE ??
    'dev';

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

  for (const it of items) {
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

  const from = process.env.SUMMARY_FROM_EMAIL;
  const to = process.env.SUMMARY_TO_EMAIL;

  if (from && to) {
    const subject = `[Project A] Daily summary (${stage})`;
    const bodyText =
      `userId: ${userId}\n` +
      `count: ${count}\n` +
      `totalAmount: ${totalAmount}\n` +
      `monthlyTotals: ${JSON.stringify(monthlyTotals)}\n` +
      `generatedAt: ${responsePayload.generatedAt}\n`;

    try {
      await ses.send(
        new SendEmailCommand({
          Source: from,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: subject },
            Body: { Text: { Data: bodyText } },
          },
        })
      );
      log('summary.email.sent', { subject });
    } catch (error) {
      // Don't fail the summary run if the notification email can't be sent.
      log('summary.email.failed', {
        subject,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    }
  } else {
    log('summary.email.skipped', {
      reason: 'missing env',
      hasFrom: !!from,
      hasTo: !!to,
    });
  }

  // HTTP API
  if (event?.requestContext) {
    return ok(responsePayload);
  }

  // EventBridge / AWS Lambda Invoke
  return responsePayload;
};
