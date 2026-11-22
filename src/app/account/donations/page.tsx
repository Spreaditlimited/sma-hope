import Dashboard from '@/components/account/pages/donations';
import { requirePageAccount } from '@/lib/auth/require-page-account';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await requirePageAccount('/account/donations');
  return <Dashboard />;
}
