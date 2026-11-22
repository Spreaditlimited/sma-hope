import { authCaptchaAction, verifyCaptcha } from '@/lib/captcha';
import { getAuth } from "@/lib/auth/server";
export async function GET(request: Request) {return getAuth("administrator").handler(request);}
export async function POST(request: Request) {
  const action=authCaptchaAction(request,true);
  if(action){const blocked=await verifyCaptcha(request,action);if(blocked)return blocked;}
  return getAuth("administrator").handler(request);
}
