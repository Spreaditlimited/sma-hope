import { requireAccount } from '@/lib/auth/server';
import { enrol, learningState, savePosition, submitQuiz, rateLimit } from '@/lib/learning/server';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
function failure(e:unknown) {
  const message=e instanceof Error?e.message:'';
  const status=message==='Unauthorized'?401:message==='Forbidden'||message==='Enrol first'?403:message==='Too many attempts'?429:message==='Enrolment closed'?409:/Invalid|answer|lesson/i.test(message)?400:503;
  return json({error:status===503?'Learning is temporarily unavailable. Please try again.':message},status);
}
export async function GET(request:Request) {
  try {const user=await requireAccount(request);return json(await learningState(user.id));}catch(e){return failure(e);}
}
export async function POST(request:Request) {
  try {
    const user=await requireAccount(request);
    const raw=await request.text();if(raw.length>2048)return json({error:'Invalid request'},400);
    let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid request'},400);}
    if (!body || typeof body!=='object') return json({error:'Invalid request'},400);
    await rateLimit(`${user.id}:${body.action==='quiz'?'quiz':'updates'}`,body.action==='quiz'?12:60);
    if(body.action==='enrol'){await enrol(user.id);return json({ok:true});}
    if(typeof body.lesson!=='string')return json({error:'Invalid lesson'},400);
    if(body.action==='progress'){await savePosition(user.id,body.lesson,body.position);return json({ok:true});}
    if(body.action==='quiz')return json({ok:true,...await submitQuiz(user.id,body.lesson,body.answers)});
    return json({error:'Invalid action'},400);
  }catch(e){return failure(e);}
}
