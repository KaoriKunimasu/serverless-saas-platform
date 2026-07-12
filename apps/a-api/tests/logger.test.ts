import { log } from '../src/lib/logger';

describe('logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('writes structured JSON logs with timestamp and event name', () => {
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    log('api.requestReceived', {
      requestId: 'request-123',
      statusCode: 200,
    });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);

    const record = JSON.parse(
      consoleLogSpy.mock.calls[0][0] as string,
    );

    expect(record).toEqual(
      expect.objectContaining({
        event: 'api.requestReceived',
        requestId: 'request-123',
        statusCode: 200,
      }),
    );

    expect(record.timestamp).toEqual(expect.any(String));
  });

  test('redacts sensitive values before writing logs', () => {
    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    log('api.requestReceived', {
      requestId: 'request-123',
      authorization: 'Bearer secret-token',
      userId: 'user-123',
      body: {
        email: 'kaori@example.com',
        amount: 12.5,
      },
      nested: {
        password: 'not-safe-to-log',
        safeValue: 'visible',
      },
    });

    const record = JSON.parse(
      consoleLogSpy.mock.calls[0][0] as string,
    );

    expect(record.authorization).toBe('[REDACTED]');
    expect(record.userId).toBe('[REDACTED]');
    expect(record.body).toBe('[REDACTED]');
    expect(record.nested.password).toBe('[REDACTED]');
    expect(record.nested.safeValue).toBe('visible');

    expect(JSON.stringify(record)).not.toContain('secret-token');
    expect(JSON.stringify(record)).not.toContain('user-123');
    expect(JSON.stringify(record)).not.toContain('kaori@example.com');
    expect(JSON.stringify(record)).not.toContain('not-safe-to-log');
  });
});
