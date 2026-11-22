import { CourseWorkspace } from '@/components/learning/player';
import { requirePageAccount } from '@/lib/auth/require-page-account';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await requirePageAccount('/account/learn');
  return <CourseWorkspace />;
}
