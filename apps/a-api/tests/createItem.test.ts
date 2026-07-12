jest.mock('../src/lib/ddb', () => ({
  ddb: {
    send: jest.fn(),
  },
  TABLE_NAME: 'test-items',
}));

jest.mock('../src/lib/logger', () => ({
  log: jest.fn(),
}));

import { ddb } from '../src/lib/ddb';
import { handler } from '../src/handlers/createItem';

const sendMock = ddb.send as jest.Mock;

const authenticatedEvent = (body: unknown) => ({
  body: typeof body === 'string' ? body : JSON.stringify(body),
  requestContext: {
    authorizer: {
      jwt: {
        claims: {
          sub: 'user-123',
        },
      },
    },
  },
});

describe('createItem handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sendMock.mockResolvedValue({});
  });

  test('creates an item for an authenticated user with valid input', async () => {
    const response = await handler(
      authenticatedEvent({
        name: 'Lunch',
        amount: 12.5,
      }),
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(response.body);

    expect(body).toEqual(
      expect.objectContaining({
        pk: 'USER#user-123',
        name: 'Lunch',
        amount: 12.5,
      }),
    );

    expect(body.sk).toMatch(/^ITEM#/);
    expect(body.createdAt).toEqual(expect.any(String));

    expect(sendMock).toHaveBeenCalledTimes(1);

    const command = sendMock.mock.calls[0][0];

    expect(command.input).toEqual(
      expect.objectContaining({
        TableName: 'test-items',
        Item: expect.objectContaining({
          pk: 'USER#user-123',
          name: 'Lunch',
          amount: 12.5,
        }),
      }),
    );
  });

  test('returns 400 when the request body is missing', async () => {
    const response = await handler({
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: 'user-123',
            },
          },
        },
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Missing body',
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  test('returns 400 when the request body contains invalid JSON', async () => {
    const response = await handler(
      authenticatedEvent('{"name":"Lunch","amount":'),
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid JSON',
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  test('returns 400 when the request body fails schema validation', async () => {
    const response = await handler(
      authenticatedEvent({
        name: '',
        amount: 0,
      }),
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid input',
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  test('returns 401 when the JWT user identity is missing', async () => {
    const response = await handler({
      body: JSON.stringify({
        name: 'Lunch',
        amount: 12.5,
      }),
      requestContext: {
        authorizer: {},
      },
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Authentication required',
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  test('returns 500 without exposing DynamoDB error details', async () => {
    sendMock.mockRejectedValueOnce(
      new Error('DynamoDB conditional check failed'),
    );

    const response = await handler(
      authenticatedEvent({
        name: 'Lunch',
        amount: 12.5,
      }),
    );

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal server error',
    });

    expect(response.body).not.toContain('DynamoDB');
    expect(response.body).not.toContain('conditional check failed');
  });
});
