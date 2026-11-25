import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authOrigin } from '@/lib/auth/server';
import { requireAdminUser } from '@/lib/admin/server';
export async function diagnosticPageAdmin(path: string) {
    try {
        return await requireAdminUser(new Request(authOrigin() + path, { headers: await headers() }), ['admin']);
    }
    catch {
        redirect('/admin/login?next=' + encodeURIComponent(path));
    }
}
