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
import { handler } from '../src/handlers/listItems';

const sendMock = ddb.send as jest.Mock;

const authenticatedEvent = () => ({
  rawPath: '/items',
  requestContext: {
    requestId: 'request-123',
    http: {
      method: 'GET',
    },
    authorizer: {
      jwt: {
        claims: {
          sub: 'user-123',
        },
      },
    },
  },
});

describe('listItems handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('queries items scoped to the authenticated user', async () => {
    sendMock.mockResolvedValueOnce({ Items: [{ pk: 'USER#user-123', sk: 'ITEM#1' }] });

    const response = await handler(authenticatedEvent());

    expect(response.statusCode).toBe(200);

    const command = sendMock.mock.calls[0][0];

    expect(command.input).toEqual(
      expect.objectContaining({
        TableName: 'test-items',
        ExpressionAttributeValues: expect.objectContaining({
          ':pk': 'USER#user-123',
        }),
      }),
    );
  });

  test('returns 401 instead of querying under a shared identity when the JWT claim is missing', async () => {
    const response = await handler({
      rawPath: '/items',
      requestContext: {
        requestId: 'request-123',
        http: {
          method: 'GET',
        },
        authorizer: {},
      },
    });

    expect(response.statusCode).toBe(401);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
