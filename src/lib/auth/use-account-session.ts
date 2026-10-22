"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { accountAuth } from "@/lib/auth/client";
export function useAccountSession() {
  const router=useRouter();
  const {data,isPending}=accountAuth.useSession();
  useEffect(()=>{if(!isPending && !data?.user)router.replace("/account/login");},[data,isPending,router]);
  return {loading:isPending || !data?.user,email:data?.user.email || ""};
}
