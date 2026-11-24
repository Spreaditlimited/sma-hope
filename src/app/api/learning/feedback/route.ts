import { requireAccount } from '@/lib/auth/server';
import { learnerFeedback, saveFeedback } from '@/lib/learning/feedback';
import { feedbackInput } from '@/lib/learning/feedback-input';
import { rateLimit } from '@/lib/learning/server';
export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
function failure(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const status = message === 'Unauthorized' ? 401 : ['Forbidden', 'Enrol first'].includes(message) ? 403 : message === 'Too many attempts' ? 429 : error instanceof SyntaxError || /Invalid feedback|Choose a rating|Keep each answer/.test(message) ? 400 : 503;
  return json({ error: status === 503 ? 'Feedback is temporarily unavailable. Please try again.' : message }, status);
}
export async function GET(request: Request) {
  try { const user = await requireAccount(request); return json(await learnerFeedback(user.id)); } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const user = await requireAccount(request);
    const raw = await request.text();
    if (raw.length > 16000) return json({ error: 'Invalid feedback' }, 400);
    const input = feedbackInput(JSON.parse(raw));
    await rateLimit(`${user.id}:feedback`, 6);
    return json(await saveFeedback(user.id, input));
  } catch (error) { return failure(error); }
}
