import { CAPTCHA_ACTIONS, verifyCaptcha } from '@/lib/captcha';
import { getAuth } from "@/lib/auth/server";
export async function POST(request: Request) {
  const blocked=await verifyCaptcha(request,CAPTCHA_ACTIONS.passwordReset);if(blocked)return blocked;
  const url = new URL(request.url); url.pathname = "/api/auth/request-password-reset";
  return getAuth().handler(new Request(url,request));
}
