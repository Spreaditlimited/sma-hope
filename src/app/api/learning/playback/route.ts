import { requireAccount } from '@/lib/auth/server';
import { requireEnrolment, lessonAsset, rateLimit } from '@/lib/learning/server';
import { buildSignedLessonEmbedUrl } from '@/lib/learning/playback';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  try {
    const user=await requireAccount(request);await requireEnrolment(user.id);await rateLimit(`${user.id}:playback`,30);
    const slug=new URL(request.url).searchParams.get('lesson')||'',a=lessonAsset(slug);
    if(!a)return Response.json({error:'Lesson not found'},{status:404});
    const playback=buildSignedLessonEmbedUrl({videoUid:a.uid,hlsUrl:a.playback.hls});
    return Response.json({...playback,transcript:a.transcript,sources:a.sources},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){const m=e instanceof Error?e.message:'';const status=m==='Unauthorized'?401:m==='Enrol first'?403:m==='Too many attempts'?429:503;return Response.json({error:status===503?'Video playback is temporarily unavailable. Please try again.':m},{status,headers:{'Cache-Control':'no-store'}});}
}
