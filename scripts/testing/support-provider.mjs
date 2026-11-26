import fs from 'node:fs';
if(process.env.NODE_ENV==='production'||process.env.SMAHOPE_AUTH_URL!=='http://localhost:3043'||!process.env.SMAHOPE_TEST_DATABASE_URL?.includes('@127.0.0.1:33317/smahope_test'))throw Error('Local support fixture only');
const original=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=input instanceof Request?input.url:String(input);
 if(url==='https://www.google.com/recaptcha/api/siteverify')return Response.json({success:true,score:0.9,action:new URLSearchParams(init.body).get('response'),hostname:'localhost',challenge_ts:new Date().toISOString()});
 if(url==='https://api.paystack.co/transaction/initialize'){
  fs.writeFileSync('/private/tmp/sma-support-checkout.json',init.body,{mode:0o600});
  return Response.json({status:true,data:{authorization_url:'http://localhost:3043/donate?fixture=checkout-ready',access_code:'isolated-only',reference:'isolated-only'}});
 }
 if(url.startsWith('https://api.paystack.co/'))throw Error('Unmocked Paystack call blocked');
 return original(input,init);
};
