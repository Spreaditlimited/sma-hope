import { diagnosticPageAdmin } from '@/lib/diagnostics/admin-page';
import { AdminShell } from '@/components/admin/admin-shell';
import { DiagnosticAdmin } from '@/components/diagnostics/admin';
export const dynamic = 'force-dynamic';
export default async function Page() { const user = await diagnosticPageAdmin('/admin/diagnostics'); return <AdminShell title="Diagnostic access" subtitle="Clinical access, agreed fees and accountable programme delivery." email={user.email} role={user.role}><DiagnosticAdmin /></AdminShell>; }
