"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export type AdminSession = { loading:boolean;email:string;role:"admin"|"ops"|"" };
export function useAdminSession(): AdminSession {
  const router = useRouter();
  const [state,setState] = useState<AdminSession>({loading:true,email:"",role:""});
  useEffect(()=>{
    let cancelled=false;
    fetch("/api/admin/me",{cache:"no-store"}).then(async(response)=>{
      if (!response.ok) {router.replace("/admin/login");return;}
      const data=await response.json();
      if(!cancelled)setState({loading:false,email:data.email,role:data.role});
    }).catch(()=>router.replace("/admin/login"));
    return ()=>{cancelled=true;};
  },[router]);
  return state;
}
