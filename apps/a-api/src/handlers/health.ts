import { log } from '../lib/logger';
import { ok } from '../lib/response';

/**
 * Public health endpoint for basic API availability checks.
 *
 * This handler intentionally does not expose credentials, environment
 * variables, customer data, or dependency details.
 */
export const handler = async (event: any) => {
  const requestId = event?.requestContext?.requestId ?? 'unknown';
  const stage = process.env.STAGE ?? 'unknown';

  const response = {
    service: 'project-a-api',
    status: 'ok',
    stage,
    timestamp: new Date().toISOString(),
  };

  log('health.checkSucceeded', {
    requestId,
    statusCode: 200,
    service: response.service,
    stage,
  });

  return ok(response);
};
