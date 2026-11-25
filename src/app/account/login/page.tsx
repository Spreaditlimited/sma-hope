import { LoginPage } from "@/components/login-page";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 const next=typeof params.next==='string'&&['/account/diagnostics','/account/clinician'].includes(params.next)?params.next:null;
 return <LoginPage returnTo={next} setup={params.setup === "1"} />;
}
