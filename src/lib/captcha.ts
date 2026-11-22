import 'server-only';
import { isIP } from 'node:net';

export const CAPTCHA_ACTIONS = {
  register: 'register', login: 'login', adminLogin: 'admin_login',
  passwordReset: 'password_reset', adminPasswordReset: 'admin_password_reset',
  passwordUpdate: 'password_update', adminPasswordUpdate: 'admin_password_update',
  contact: 'contact', newsletter: 'newsletter',
} as const;
export type CaptchaAction = typeof CAPTCHA_ACTIONS[keyof typeof CAPTCHA_ACTIONS];

export async function verifyCaptcha(request: Request, action: CaptchaAction): Promise<Response | null> {
  const fail = (status = 403) => Response.json({code:'CAPTCHA_FAILED',error:status===503
    ? 'Security verification is temporarily unavailable. Please try again shortly.'
    : 'Security verification failed. Please try again.'}, {status,headers:{'Cache-Control':'no-store'}});
  const secret = process.env.SMAHOPE_CAPTCHA_SECRET_KEY?.trim();
  if (!secret || !process.env.SMAHOPE_CAPTCHA_SITE_KEY?.trim()) return fail(503);
  const token = request.headers.get('x-captcha-token');
  if (!token || token.length>8192 || /\s/.test(token)) return fail();
  const form = new URLSearchParams({secret,response:token});
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() : '';
  if (ip && isIP(ip)) form.set('remoteip',ip);
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:form,cache:'no-store',signal:AbortSignal.timeout(6000),
    });
    if (!response.ok) return fail(503);
    const data = await response.json();
    const allowedHosts = ['smahope.org','www.smahope.org',...(process.env.NODE_ENV!=='production'?['localhost','127.0.0.1']:[])];
    const age = Date.now()-Date.parse(data.challenge_ts);
    // Reject error/over-quota responses even if Google also returns success=true.
    if (data.success!==true || data['error-codes']?.length || data.action!==action ||
        typeof data.score!=='number' || !Number.isFinite(data.score) || data.score<0.5 || data.score>1 ||
        !allowedHosts.includes(data.hostname) || !Number.isFinite(age) || age>120_000 || age< -30_000) return fail();
    return null;
  } catch { return fail(503); }
}

export function authCaptchaAction(request: Request, admin=false): CaptchaAction | null {
  const path=new URL(request.url).pathname.replace(/\/+$/,'');
  const base=admin?'/api/admin-auth':'/api/auth';
  if (path===base+'/sign-up/email') return CAPTCHA_ACTIONS.register;
  if (path===base+'/sign-in/email') return admin?CAPTCHA_ACTIONS.adminLogin:CAPTCHA_ACTIONS.login;
  if (path===base+'/request-password-reset') return admin?CAPTCHA_ACTIONS.adminPasswordReset:CAPTCHA_ACTIONS.passwordReset;
  if (path===base+'/reset-password') return admin?CAPTCHA_ACTIONS.adminPasswordUpdate:CAPTCHA_ACTIONS.passwordUpdate;
  return null;
}
