import { getAuth } from "@/lib/auth/server";
export async function POST(request: Request) {
  const url = new URL(request.url); url.pathname = "/api/auth/request-password-reset";
  return getAuth().handler(new Request(url,request));
}
