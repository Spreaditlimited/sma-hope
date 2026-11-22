import Dashboard from '@/components/account/pages/orders';
import { requirePageAccount } from '@/lib/auth/require-page-account';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await requirePageAccount('/account/orders');
  return <Dashboard />;
}
