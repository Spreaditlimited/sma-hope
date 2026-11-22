import 'server-only';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { CONSENT_COOKIE } from './cookie-consent';

const PIXEL_ID = '2521801154897796';
const SOURCE_URL = 'https://www.smahope.org/account/register';
type LeadEvent = {
  event_name: 'Lead'; event_time: number; event_id: string;
  action_source: 'website'; event_source_url: string;
  user_data: { client_user_agent: string; client_ip_address?: string; fbp?: string; fbc?: string };
};

function cookie(request: Request, name: string) {
  return (request.headers.get('cookie') || '').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1) || '';
}

export function buildCourseSignupLead(request: Request, userId: string): LeadEvent | null {
  if (cookie(request, CONSENT_COOKIE) !== 'accepted' || !userId || userId.length > 100) return null;
  // This campaign is Nigeria-only. Use Vercel's trusted geolocation, not form-supplied country data.
  if (!process.env.VERCEL || request.headers.get('x-vercel-ip-country') !== 'NG') return null;
  const userAgent = request.headers.get('user-agent')?.trim().slice(0, 500);
  if (!userAgent) return null;
  const userData: LeadEvent['user_data'] = { client_user_agent: userAgent };
  const ip = (request.headers.get(process.env.VERCEL ? 'x-vercel-forwarded-for' : 'x-real-ip') || '').split(',')[0].trim();
  if (isIP(ip)) userData.client_ip_address = ip;
  for (const [name, key] of [['_fbp','fbp'],['_fbc','fbc']] as const) {
    const value = cookie(request, name);
    if (/^fb\.\d\.\d{10,16}\.[A-Za-z0-9_.-]{1,500}$/.test(value)) userData[key] = value;
  }
  // A stable opaque ID deduplicates retries without sending the account ID to Meta.
  return { event_name: 'Lead', event_time: Math.floor(Date.now()/1000),
    event_id: 'signup_'+createHash('sha256').update('account-created:'+userId).digest('hex'),
    action_source: 'website', event_source_url: SOURCE_URL, user_data: userData };
}

export async function sendCourseSignupLead(event: LeadEvent) {
  if (process.env.META_CAPI_ENABLED !== 'true') return { status: 'disabled' as const };
  const token = process.env.SMAHOPE_CAPI_TOKEN;
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (!token || (process.env.NODE_ENV !== 'production' && !testCode)) return { status: 'unconfigured' as const };
  const version = process.env.META_CAPI_GRAPH_VERSION || 'v25.0';
  if (!/^v\d+\.0$/.test(version)) return { status: 'unconfigured' as const };
  const payload = { data: [event], ...(testCode ? { test_event_code: testCode } : {}) };
  // Retry transient delivery once with the same ID and event time. Never log identifiers or provider payloads.
  for (let attempt=0;attempt<2;attempt++) {
    try {
      const response=await fetch(`https://graph.facebook.com/${version}/${PIXEL_ID}/events`, {
        method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify(payload),signal:AbortSignal.timeout(4000),
      });
      if (!response.ok) {
        if (attempt===0 && (response.status===429 || response.status>=500)) continue;
        console.warn('Meta course signup measurement: event not acknowledged (HTTP '+response.status+').');
        return { status:'failed' as const };
      }
      const result=await response.json();
      if (Number(result.events_received)!==1) {
        console.warn('Meta course signup measurement: event not acknowledged.');
        return { status:'failed' as const };
      }
      return { status:'sent' as const };
    } catch {
      if (attempt===0) continue;
      console.warn('Meta course signup measurement: delivery unavailable.');
    }
  }
  return { status:'failed' as const };
}
