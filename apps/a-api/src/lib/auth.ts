export function getAuthenticatedUserId(event: any): string | undefined {
  const jwtSubject = event?.requestContext?.authorizer?.jwt?.claims?.sub;

  if (jwtSubject) {
    return String(jwtSubject);
  }

  const legacySubject = event?.requestContext?.authorizer?.claims?.sub;

  if (legacySubject) {
    return String(legacySubject);
  }

  return undefined;
}

export function getUserId(event: any): string {
  // EventBridge / Lambda invoke
  if (event?.userId) return String(event.userId);

  if (event?.detail?.userId) return String(event.detail.userId);

  const authenticatedUserId = getAuthenticatedUserId(event);

  if (authenticatedUserId) {
    return authenticatedUserId;
  }

  throw new Error('getUserId: no userId on the event and no authenticated claim found.');
}
