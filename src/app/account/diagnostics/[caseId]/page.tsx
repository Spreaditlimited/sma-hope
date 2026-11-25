import { requirePageAccount } from '@/lib/auth/require-page-account';
import { AccountWorkspaceShell } from '@/components/account/workspace-shell';
import { CaseDetail } from '@/components/diagnostics/case-detail';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: {
    params: Promise<{
        caseId: string;
    }>;
}) { const { caseId } = await params; const user = await requirePageAccount('/account/diagnostics/' + caseId); return <AccountWorkspaceShell title="Private case" subtitle="Your referral, consultation and next steps." email={user.email}><CaseDetail caseId={caseId}/></AccountWorkspaceShell>; }
