import { requirePageAccount } from '@/lib/auth/require-page-account';
import { AccountWorkspaceShell } from '@/components/account/workspace-shell';
import { DiagnosticWorkspace } from '@/components/diagnostics/workspace';
export const dynamic = 'force-dynamic';
export default async function Page() { const user = await requirePageAccount('/account/clinician'); return <AccountWorkspaceShell title="Clinician network" subtitle="Your professional application and assigned consultations." email={user.email}><DiagnosticWorkspace clinician/></AccountWorkspaceShell>; }
