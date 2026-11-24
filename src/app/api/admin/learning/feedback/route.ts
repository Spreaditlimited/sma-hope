import { requireAdminUser } from '@/lib/admin/server';
import { feedbackReport } from '@/lib/learning/feedback';
export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
export async function GET(request: Request) {
  try {
    await requireAdminUser(request, ['admin', 'ops']);
    const raw = new URL(request.url).searchParams.get('page') || '1';
    if (!/^[1-9]\d{0,5}$/.test(raw)) return json({ error: 'Invalid page' }, 400);
    return json(await feedbackReport(Number(raw)));
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return json({ error: 'Unable to load course feedback.' }, message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 503);
  }
}
