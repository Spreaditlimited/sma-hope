import { requireAdminUser } from '@/lib/admin/server';
import { learningReport } from '@/lib/learning/server';
import { getPool } from '@/lib/database/pool';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  try {
    await requireAdminUser(request,['admin','ops']);
    const url=new URL(request.url),report=await learningReport(url.searchParams.get('month')||new Date().toISOString().slice(0,7));
    if(url.searchParams.get('format')==='csv') {
      const csv=['learner,enrolled_at,completed_lessons,first_score,latest_score,questions_attempted',...report.rows.map(x=>[x.learner,new Date(x.enrolledAt).toISOString(),x.completedLessons,x.first,x.latest,x.questions].join(','))].join('\r\n');
      return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="sma-learning-${report.month}.csv"`,'Cache-Control':'no-store'}});
    }
    const [courses]=await getPool().promise().query('SELECT slug,title,is_free,is_published FROM learning_courses');
    return Response.json({...report,courses},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){const m=e instanceof Error?e.message:'';return Response.json({error:'Unable to load learning report.'},{status:m==='Unauthorized'?401:m==='Forbidden'?403:m==='Invalid month'?400:503});}
}
export async function POST(request:Request) {
  try {
    await requireAdminUser(request,['admin']);
    const raw=await request.text();if(raw.length>512)return Response.json({error:'Invalid settings'},{status:400});
    const body=JSON.parse(raw);
    if(typeof body.isFree!=='boolean'||typeof body.isPublished!=='boolean')return Response.json({error:'Invalid settings'},{status:400});
    await getPool().promise().query("UPDATE learning_courses SET is_free=?,is_published=?,updated_at=NOW(3) WHERE slug='understanding-sma'",[body.isFree,body.isPublished]);
    return Response.json({ok:true});
  }catch(e){const m=e instanceof Error?e.message:'';return Response.json({error:'Unable to update course.'},{status:m==='Unauthorized'?401:m==='Forbidden'?403:503});}
}
