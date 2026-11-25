import { LearnerRegistration } from "@/components/learning/register";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const params=await searchParams;const next=typeof params.next==='string'&&['/account/diagnostics','/account/clinician'].includes(params.next)?params.next:null;return <LearnerRegistration returnTo={next}/>;}
