'use client';

type Recaptcha = { ready(callback:()=>void):void; execute(key:string,options:{action:string}):Promise<string> };
declare global { interface Window { grecaptcha?: Recaptcha } }
let configuration: Promise<string> | undefined;
let loading: Promise<Recaptcha> | undefined;

function siteKey() {
  if (!configuration) configuration=fetch('/api/captcha/config',{cache:'no-store'})
    .then(async response=>{if(!response.ok)throw new Error('unavailable');const data=await response.json();if(typeof data.siteKey!=='string'||!data.siteKey)throw new Error('unavailable');return data.siteKey as string;})
    .catch(error=>{configuration=undefined;throw error;});
  return configuration;
}
function load(key:string) {
  if (!loading) loading=new Promise<Recaptcha>((resolve,reject)=>{
    const script=document.createElement('script');
    const timer=window.setTimeout(()=>{script.remove();reject(new Error('timeout'));},15000);
    script.src=`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    script.async=true;
    script.onerror=()=>{window.clearTimeout(timer);script.remove();reject(new Error('unavailable'));};
    script.onload=()=>{
      if(!window.grecaptcha){window.clearTimeout(timer);script.remove();reject(new Error('unavailable'));return;}
      window.grecaptcha.ready(()=>{window.clearTimeout(timer);resolve(window.grecaptcha!);});
    };
    document.head.appendChild(script);
  }).catch(error=>{loading=undefined;throw error;});
  return loading;
}
export async function captchaHeaders(action:string):Promise<Record<string,string>> {
  try {
    const key=await siteKey(),api=await load(key);
    let timer:ReturnType<typeof setTimeout> | undefined;
    try {
      // Obtain a fresh, single-use token at submission, never at page load.
      const token=await Promise.race([api.execute(key,{action}),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),15000);})]);
      if(!token)throw new Error('empty token');
      return {'x-captcha-token':token};
    } finally {clearTimeout(timer);}
  } catch {
    throw new Error('Security verification could not load. Check your connection, allow reCAPTCHA, and try again.');
  }
}
