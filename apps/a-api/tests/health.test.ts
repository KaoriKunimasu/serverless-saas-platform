jest.mock('../src/lib/logger', () => ({
  log: jest.fn(),
}));

import { handler } from '../src/handlers/health';
import { log } from '../src/lib/logger';

const logMock = log as jest.Mock;

describe('health handler', () => {
  const originalStage = process.env.STAGE;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STAGE = 'test';
  });

  afterAll(() => {
    process.env.STAGE = originalStage;
  });

  test('returns service availability information', async () => {
    const response = await handler({
      requestContext: {
        requestId: 'health-request-123',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(response.body);

    expect(body).toEqual(
      expect.objectContaining({
        service: 'project-a-api',
        status: 'ok',
        stage: 'test',
      }),
    );

    expect(body.timestamp).toEqual(expect.any(String));
  });

  test('logs successful health checks with request correlation context', async () => {
    await handler({
      requestContext: {
        requestId: 'health-request-123',
      },
    });

    expect(logMock).toHaveBeenCalledWith(
      'health.checkSucceeded',
      expect.objectContaining({
        requestId: 'health-request-123',
        statusCode: 200,
        service: 'project-a-api',
        stage: 'test',
      }),
    );
  });

  test('does not expose sensitive configuration values', async () => {
    process.env.DEMO_SECRET = 'must-not-appear-in-response';

    const response = await handler({
      requestContext: {
        requestId: 'health-request-123',
      },
    });

    expect(response.body).not.toContain('must-not-appear-in-response');
    expect(response.body).not.toContain('DEMO_SECRET');

    delete process.env.DEMO_SECRET;
  });
});
