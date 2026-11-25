/** Preserve auth responses, but never send framework error pages to an API client. */
export async function handleAuthRequest(request: Request, handler: (request: Request) => Promise<Response>) {
  try {
    return await handler(request);
  } catch {
    // Log no credentials, request bodies, OAuth codes or account details.
    console.error('Account service request failed. Check database availability.');
    return Response.json({error:'Sign-in is temporarily unavailable. Please try again shortly.'}, {
      status:503,
      headers:{'Cache-Control':'no-store','Retry-After':'30'},
    });
  }
}
