import { requirePageAccount } from '@/lib/auth/require-page-account';
import { AccountWorkspaceShell } from '@/components/account/workspace-shell';
import { CourseFeedbackForm } from '@/components/learning/course-feedback';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await requirePageAccount('/account/learn/feedback');
  return <AccountWorkspaceShell title="Your course feedback" subtitle="Tell us what helped and what we can improve." email={user.email}><CourseFeedbackForm /></AccountWorkspaceShell>;
}
