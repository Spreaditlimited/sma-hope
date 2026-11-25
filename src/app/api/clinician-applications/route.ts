import { createHash } from 'node:crypto';
import { assertSameOrigin } from '@/lib/auth/server';
import { verifyCaptcha } from '@/lib/captcha';
import { rateLimit } from '@/lib/learning/server';
import { failure, input, json } from '@/lib/diagnostics/http';
import { object } from '@/lib/diagnostics/domain';
import { publicClinicianApplication } from '@/lib/diagnostics/public-application';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const captcha = await verifyCaptcha(request, 'register');
    if (captcha) return captcha;
    const value = object(await input(request));
    const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'unknown' : 'local';
    await rateLimit('public-clinician-ip:'+ip, 6, 3600);
    await rateLimit('public-clinician-email:'+createHash('sha256').update(String(value.email || '').trim().toLowerCase()).digest('hex'), 3, 3600);
    return json(await publicClinicianApplication(value), 202);
  } catch (error) { return failure(error); }
}
