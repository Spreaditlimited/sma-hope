import { requirePageAccount } from '@/lib/auth/require-page-account';
import { AccountWorkspaceShell } from '@/components/account/workspace-shell';
import { DiagnosticWorkspace } from '@/components/diagnostics/workspace';
export const dynamic = 'force-dynamic';
export default async function Page() { const user = await requirePageAccount('/account/diagnostics'); return <AccountWorkspaceShell title="Your diagnostic access space" subtitle="Report a concern and follow your referral privately." email={user.email}><DiagnosticWorkspace /></AccountWorkspaceShell>; }
