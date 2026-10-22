import { ResetPasswordPage } from "@/components/reset-password-page";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 return <ResetPasswordPage  token={typeof params.token === "string" ? params.token : ""} />;
}
