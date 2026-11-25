import { after, NextResponse, type NextRequest } from 'next/server';
import { requireAccount } from '@/lib/auth/server';
import { GOOGLE_REGISTRATION_COOKIE, GOOGLE_REGISTRATION_PATH, readGoogleRegistration } from '@/lib/auth/google-registration';
import { GOOGLE_ADS_CONSENT_COOKIE } from '@/lib/cookie-consent';
import { buildCourseSignupLead, sendCourseSignupLead } from '@/lib/meta-course-lead';
export async function POST(request: NextRequest) {
  try {
    const user = await requireAccount(request);
    const receipt = readGoogleRegistration(request.cookies.get(GOOGLE_REGISTRATION_COOKIE)?.value,user.id);
    const permitted = request.cookies.get(GOOGLE_ADS_CONSENT_COOKIE)?.value === 'accepted';
    const response = NextResponse.json({receipt:permitted ? receipt : null},{headers:{'Cache-Control':'private, no-store'}});
    response.cookies.set(GOOGLE_REGISTRATION_COOKIE,'',{httpOnly:true,secure:new URL(request.url).protocol==='https:',sameSite:'lax',path:GOOGLE_REGISTRATION_PATH,maxAge:0});
    if (receipt) {
      try {
        const event = buildCourseSignupLead(request,user.id);
        if (event) after(async()=>{await sendCourseSignupLead(event);});
      } catch { /* Optional measurement must not affect an authenticated account. */ }
    }
    return response;
  } catch {
    return NextResponse.json({error:'Please sign in to continue.'},{status:401,headers:{'Cache-Control':'private, no-store'}});
  }
}
