export function getUserId(event: any): string {
  // EventBridge / lambda invoke
  if (event?.userId) return String(event.userId);
  if (event?.detail?.userId) return String(event.detail.userId);

  // HTTP API v2 + JWT authorizer
  const sub1 = event?.requestContext?.authorizer?.jwt?.claims?.sub;
  if (sub1) return String(sub1);

  // Fallback 
  const sub2 = event?.requestContext?.authorizer?.claims?.sub;
  if (sub2) return String(sub2);

  return 'local-user';
}
