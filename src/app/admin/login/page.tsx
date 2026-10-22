import { LoginPage } from "@/components/login-page";
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 return <LoginPage admin setup={params.setup === "1"} />;
}
