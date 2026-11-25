// Server callers provide the trusted Vercel workload token; Google validates its signature and configured claims.
export type GoogleIdentityConfig = {audience:string;serviceAccount:string};
export function googleIdentityConfig(env:Record<string,string|undefined>):GoogleIdentityConfig|null {
 const audience=env.SMAHOPE_DIAGNOSTIC_GOOGLE_AUDIENCE||'',serviceAccount=env.SMAHOPE_DIAGNOSTIC_GOOGLE_SERVICE_ACCOUNT||'';
 if(!/^\/\/iam\.googleapis\.com\/projects\/\d+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/.test(audience)||! /^[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/.test(serviceAccount))return null;
 return {audience,serviceAccount};
}
export async function exchangeGoogleIdentity(token:string,config:GoogleIdentityConfig){
 if(!token||token.length>20000||token.split('.').length!==3)throw new Error('A current Vercel workload identity is required.');
 const response=await fetch('https://sts.googleapis.com/v1/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audience:config.audience,grantType:'urn:ietf:params:oauth:grant-type:token-exchange',requestedTokenType:'urn:ietf:params:oauth:token-type:access_token',scope:'https://www.googleapis.com/auth/cloud-platform',subjectTokenType:'urn:ietf:params:oauth:token-type:jwt',subjectToken:token}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Google workload identity verification failed.');
 const federated=await response.json();if(typeof federated.access_token!=='string'||!federated.access_token)throw new Error('Google workload identity verification failed.');
 const result=await fetch('https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/'+encodeURIComponent(config.serviceAccount)+':generateAccessToken',{method:'POST',headers:{Authorization:'Bearer '+federated.access_token,'Content-Type':'application/json'},body:JSON.stringify({scope:['https://www.googleapis.com/auth/drive'],lifetime:'1800s'}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!result.ok)throw new Error('Private Drive identity could not be issued.');
 const credential=await result.json(),expires=Date.parse(credential.expireTime);
 if(typeof credential.accessToken!=='string'||!credential.accessToken||!Number.isFinite(expires)||expires<=Date.now()+60000||expires>Date.now()+3600000)throw new Error('Private Drive identity has an invalid lifetime.');
 return {token:credential.accessToken,expires};
}
