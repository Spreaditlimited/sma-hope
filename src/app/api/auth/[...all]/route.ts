import { getAuth, assertSameOrigin } from "@/lib/auth/server";
export async function GET(request: Request) {return getAuth().handler(request);}
export async function POST(request: Request) {
  if (new URL(request.url).pathname === "/api/auth/sign-up/email") {
    try {
      assertSameOrigin(request);
      const raw=await request.clone().text();
      if(raw.length>2048)return Response.json({error:"Invalid registration"},{status:400});
      const body=JSON.parse(raw);
      if(body.terms!==true || typeof body.name!=="string" || body.name.trim().length<2 || body.name.length>180 || typeof body.password!=="string" || body.password.length>128)return Response.json({error:"Please complete the registration form and accept the terms."},{status:400});
    } catch { return Response.json({error:"Invalid registration"},{status:403}); }
  }
  return getAuth().handler(request);
}
