import { googleSignInEnabled } from "@/lib/auth/google-registration";
import { GoogleRegistrationComplete } from "@/components/learning/google-registration-complete";
import { LearnerRegistration } from "@/components/learning/register";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const next=typeof params.next==='string'&&['/account/diagnostics','/account/clinician'].includes(params.next)?params.next:null;if(params.google==="complete")return <GoogleRegistrationComplete/>;return <LearnerRegistration returnTo={next} googleEnabled={googleSignInEnabled()}/>;}
