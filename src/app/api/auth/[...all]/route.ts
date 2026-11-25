import { googleAdsRegistrationReceipt, GOOGLE_ADS_REGISTRATION_HEADER } from '@/lib/google-ads-registration';
import { authCaptchaAction, verifyCaptcha } from '@/lib/captcha';
import { savePreferences } from '@/lib/learning/reminders';
import { after } from 'next/server';
import { getAuth, assertSameOrigin } from '@/lib/auth/server';
import { buildCourseSignupLead, sendCourseSignupLead } from '@/lib/meta-course-lead';
export async function GET(request: Request) {return getAuth().handler(request);}
export async function POST(request: Request) {
  const action=authCaptchaAction(request);
  if(action){const blocked=await verifyCaptcha(request,action);if(blocked)return blocked;}
  const signup=new URL(request.url).pathname.replace(/\/+$/,'') === '/api/auth/sign-up/email';
  let courseSignup=false;
  let learningEmails=false;
  if (signup) {
    try {
      assertSameOrigin(request);
      const raw=await request.clone().text();
      if(raw.length>2048)return Response.json({error:'Invalid registration'},{status:400});
      const body=JSON.parse(raw);
      if(body.terms!==true || typeof body.name!=='string' || body.name.trim().length<2 || body.name.length>180 || typeof body.password!=='string' || body.password.length>128)return Response.json({error:'Please complete the registration form and accept the terms.'},{status:400});
      courseSignup=body.signupSource==='learning';
      learningEmails=body.learningEmails===true;
    } catch { return Response.json({error:'Invalid registration'},{status:403}); }
  }
  const response=await getAuth().handler(request);
  if (courseSignup && response.ok) {
    try {
      const created=await response.clone().json();
      if (typeof created.user?.id==='string') {
        if(learningEmails){try{await savePreferences(created.user.id,true,0,'registration');}catch{console.warn('Learning email preference could not be saved; learner can choose again in account.');}}
        try {
          const receipt=googleAdsRegistrationReceipt(request);
          if(receipt)response.headers.set(GOOGLE_ADS_REGISTRATION_HEADER,receipt);
        } catch { console.warn('Optional Google registration measurement could not be prepared.'); }
        const event=buildCourseSignupLead(request,created.user.id);
        if(event)after(async()=>{await sendCourseSignupLead(event);});
      }
    } catch {
      // Advertising measurement must never break a successful registration or expose its details.
      console.warn('Optional course signup measurement: unable to prepare event.');
    }
  }
  return response;
}
