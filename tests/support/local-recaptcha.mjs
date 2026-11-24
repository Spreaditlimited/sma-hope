// Test-process-only provider stub. Never imported by application code or production.
const url=process.env.SMAHOPE_TEST_DATABASE_URL||'';
if(process.env.NODE_ENV==='production'||!url.includes('@127.0.0.1:33317/smahope_test')||process.env.SMAHOPE_AUTH_URL!=='http://localhost:3021')throw Error('Local CAPTCHA fixture requires isolated test configuration');
const original=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 if(String(input)==='https://www.google.com/recaptcha/api/siteverify'){
  const action=new URLSearchParams(init.body).get('response');
  return Response.json({success:true,score:0.9,action,hostname:'localhost',challenge_ts:new Date().toISOString()});
 }
 return original(input,init);
};
