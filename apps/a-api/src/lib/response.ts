export const ok = (body: unknown) => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const badRequest = (message: string) => ({
  statusCode: 400,
  body: JSON.stringify({ message }),
});
