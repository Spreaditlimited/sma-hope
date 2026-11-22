export const dynamic='force-dynamic';
export async function GET() {
  const siteKey=process.env.SMAHOPE_CAPTCHA_SITE_KEY?.trim();
  if(!siteKey || !process.env.SMAHOPE_CAPTCHA_SECRET_KEY?.trim()) return Response.json({error:'Security verification is unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});
  return Response.json({siteKey},{headers:{'Cache-Control':'no-store'}});
}
