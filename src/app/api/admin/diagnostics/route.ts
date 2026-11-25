import { requireAdminUser } from '@/lib/admin/server';
import { adminAction, adminWorkspace } from '@/lib/diagnostics/server';
import { failure, input, json } from '@/lib/diagnostics/http';
import { rateLimit } from '@/lib/learning/server';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try {
    const user = await requireAdminUser(request, ['admin']);
    const url = new URL(request.url);
    return json(await adminWorkspace({ userId: user.userId, role: 'admin' }, url.searchParams.get('case') || undefined, Number(url.searchParams.get('page') || 1)));
}
catch (e) {
    return failure(e);
} }
export async function POST(request: Request) { try {
    const user = await requireAdminUser(request, ['admin']);
    await rateLimit(user.userId + ':diagnostic-admin', 30);
    return json(await adminAction({ userId: user.userId, role: 'admin' }, await input(request)));
}
catch (e) {
    return failure(e);
} }
