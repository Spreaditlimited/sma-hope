import { tryDiagnosticNotifications } from '@/lib/diagnostics/notifications';
import { requireAccount } from '@/lib/auth/server';
import { claimConfirmedPublicReports } from '@/lib/diagnostics/public-report';
import { accountAction, workspace } from '@/lib/diagnostics/server';
import { failure, input, json } from '@/lib/diagnostics/http';
import { rateLimit } from '@/lib/learning/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try {
    const user = await requireAccount(request);
    await claimConfirmedPublicReports(user.id);
    return json(await workspace({ userId: user.id, role: 'account' }, new URL(request.url).searchParams.get('case') || undefined));
}
catch (e) {
    return failure(e);
} }
export async function POST(request: Request) { try {
    const user = await requireAccount(request);
    await rateLimit(user.id + ':diagnostics', 12);
    const result = await accountAction({ userId: user.id, role: 'account' }, await input(request));
    await tryDiagnosticNotifications();
    return json(result);
}
catch (e) {
    return failure(e);
} }
