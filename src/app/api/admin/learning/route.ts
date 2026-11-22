import { requireAdminUser } from '@/lib/admin/server';
import { learningOverview, learningCohortCsv, learnerDetail } from '@/lib/learning/reporting';
import { getPool } from '@/lib/database/pool';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(request:Request) {
  try {
    await requireAdminUser(request,['admin','ops']);
    const url=new URL(request.url),learner=url.searchParams.get('learner');
    if(learner!==null){const data=await learnerDetail(learner);return data?json(data):json({error:'Learner not found.'},404);}
    if(url.searchParams.get('format')==='csv'){
      const month=url.searchParams.get('month')||'all',csv=await learningCohortCsv(month);
      return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="sma-learning-${month}.csv"`,'Cache-Control':'private, no-store'}});
    }
    return json(await learningOverview(url.searchParams));
  }catch(e){const m=e instanceof Error?e.message:'';return json({error:m.startsWith('Invalid ')?m:'Unable to load learning report.'},m==='Unauthorized'?401:m==='Forbidden'?403:m.startsWith('Invalid ')?400:503);}
}
export async function POST(request:Request) {
  try {
    await requireAdminUser(request,['admin']);
    const raw=await request.text();if(raw.length>512)return json({error:'Invalid settings' },400);
    const body=JSON.parse(raw);
    if(typeof body.isFree!=='boolean'||typeof body.isPublished!=='boolean')return json({error:'Invalid settings'},400);
    await getPool().promise().query("UPDATE learning_courses SET is_free=?,is_published=?,updated_at=NOW(3) WHERE slug='understanding-sma'",[body.isFree,body.isPublished]);
    return json({ok:true});
  }catch(e){const m=e instanceof Error?e.message:'';return json({error:'Unable to update course.'},m==='Unauthorized'?401:m==='Forbidden'?403:e instanceof SyntaxError?400:503);}
}
