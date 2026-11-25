import { diagnosticPageAdmin } from '@/lib/diagnostics/admin-page';
import { AdminShell } from '@/components/admin/admin-shell';
import { CaseDetail } from '@/components/diagnostics/case-detail';
export const dynamic = 'force-dynamic';
export default async function Page({ params }: {
    params: Promise<{
        caseId: string;
    }>;
}) { const { caseId } = await params; const user = await diagnosticPageAdmin('/admin/diagnostics/' + caseId); return <AdminShell title="Private patient case" email={user.email} role={user.role}><CaseDetail caseId={caseId} admin/></AdminShell>; }
