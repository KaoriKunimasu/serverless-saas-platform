type LogContext = Record<string, unknown>;

const sensitiveKeys = new Set([
  'authorization',
  'token',
  'accesstoken',
  'idtoken',
  'password',
  'secret',
  'cookie',
  'body',
  'email',
  'userid',
  'username',
]);

function isSensitiveKey(key: string): boolean {
  return sensitiveKeys.has(key.toLowerCase());
}

function sanitiseValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitiseValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitised: LogContext = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      sanitised[key] = isSensitiveKey(key)
        ? '[REDACTED]'
        : sanitiseValue(nestedValue);
    }

    return sanitised;
  }

  return value;
}

function sanitiseContext(context: LogContext): LogContext {
  return sanitiseValue(context) as LogContext;
}

export const log = (event: string, context: LogContext = {}) => {
  const record = {
    ...sanitiseContext(context),
    timestamp: new Date().toISOString(),
    event,
  };

  console.log(JSON.stringify(record));
};
