// Isolated test-process provider double. Never import in application code.
if(process.env.NODE_ENV==='production'||!process.env.SMAHOPE_TEST_DATABASE_URL?.includes('@127.0.0.1:33317/smahope_test')||process.env.SMAHOPE_AUTH_URL!=='http://localhost:3041')throw Error('Diagnostic fixtures require an isolated local test database');
const original=globalThis.fetch;const uploads=new Map();let n=0;
globalThis.fetch=async(input,init={})=>{
 const u=String(input);
 if(u==='https://www.google.com/recaptcha/api/siteverify'){const action=new URLSearchParams(init.body).get('response');return Response.json({success:true,score:0.9,action,hostname:'localhost',challenge_ts:new Date().toISOString()});}
 if(u==='https://sts.googleapis.com/v1/token')return Response.json({access_token:'isolated-federated-token'});
 if(u.startsWith('https://iamcredentials.googleapis.com/'))return Response.json({accessToken:'isolated-drive-token',expireTime:new Date(Date.now()+1800000).toISOString()});
 if(u.startsWith('https://www.googleapis.com/')){
 const url=new URL(u);
 if(url.pathname.endsWith('/permissions'))return Response.json({permissions:[{type:'user',role:'organizer'}]});
 if(init.method==='POST'&&url.searchParams.get('uploadType')==='resumable'){const key='isolated-'+(++n);uploads.set(key,{parts:[],size:Number(init.headers['X-Upload-Content-Length'])});return new Response('',{headers:{location:'https://www.googleapis.com/upload/drive/v3/files?upload_id='+key}});}
 if(init.method==='PUT'){const key=url.searchParams.get('upload_id'),f=uploads.get(key);if(!f)return new Response('',{status:404});f.parts.push(Buffer.from(init.body));const total=f.parts.reduce((n,b)=>n+b.length,0);return total===f.size?Response.json({id:key}):new Response(null,{status:308,headers:{range:'bytes=0-'+(total-1)}});}
 if(url.searchParams.get('alt')==='media'){const f=uploads.get(url.pathname.split('/').pop());if(!f)return new Response('',{status:404});const b=Buffer.concat(f.parts),range=init.headers.Range.match(/bytes=(\d+)-(\d+)/);return new Response(b.subarray(Number(range[1]),Number(range[2])+1),{status:206});}
 return Response.json({id:'isolated-folder',mimeType:'application/vnd.google-apps.folder',driveId:'isolated-drive'});
 }
 return original(input,init);
};
