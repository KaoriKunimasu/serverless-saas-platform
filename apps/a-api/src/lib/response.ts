const jsonResponse = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const ok = (body: unknown) => jsonResponse(200, body);

export const badRequest = (message: string) =>
  jsonResponse(400, { message });

export const unauthorized = (message = 'Authentication required') =>
  jsonResponse(401, { message });

export const internalServerError = () =>
  jsonResponse(500, { message: 'Internal server error' });
