import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from './server';

// Validate the real account session before rendering any private page content.
export async function requirePageAccount(returnTo: string) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session?.user?.active) {
    redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  }
  return session.user;
}
