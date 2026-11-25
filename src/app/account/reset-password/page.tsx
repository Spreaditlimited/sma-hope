import { ResetPasswordPage } from "@/components/reset-password-page";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 return <ResetPasswordPage returnTo={(params.next === "/account/clinician" || params.next === "/account/diagnostics") ? params.next : undefined}  token={typeof params.token === "string" ? params.token : ""} />;
}
