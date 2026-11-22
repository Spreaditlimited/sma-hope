import { redirect } from 'next/navigation';
import { requirePageAccount } from '@/lib/auth/require-page-account';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await requirePageAccount('/account/subscriptions');
  redirect('/account/donations');
}
