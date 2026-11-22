import { after } from 'next/server';
import { getAuth, assertSameOrigin } from '@/lib/auth/server';
import { buildCourseSignupLead, sendCourseSignupLead } from '@/lib/meta-course-lead';
export async function GET(request: Request) {return getAuth().handler(request);}
export async function POST(request: Request) {
  const signup=new URL(request.url).pathname === '/api/auth/sign-up/email';
  let courseSignup=false;
  if (signup) {
    try {
      assertSameOrigin(request);
      const raw=await request.clone().text();
      if(raw.length>2048)return Response.json({error:'Invalid registration'},{status:400});
      const body=JSON.parse(raw);
      if(body.terms!==true || typeof body.name!=='string' || body.name.trim().length<2 || body.name.length>180 || typeof body.password!=='string' || body.password.length>128)return Response.json({error:'Please complete the registration form and accept the terms.'},{status:400});
      courseSignup=body.signupSource==='learning';
    } catch { return Response.json({error:'Invalid registration'},{status:403}); }
  }
  const response=await getAuth().handler(request);
  if (courseSignup && response.ok) {
    try {
      const created=await response.clone().json();
      if (typeof created.user?.id==='string') {
        const event=buildCourseSignupLead(request,created.user.id);
        if(event)after(async()=>{await sendCourseSignupLead(event);});
      }
    } catch {
      // Advertising measurement must never break a successful registration or expose its details.
      console.warn('Meta course signup measurement: unable to prepare event.');
    }
  }
  return response;
}
