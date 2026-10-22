import { requireAccount } from "@/lib/auth/server";
import { getDatabase } from "@/lib/database/store";
export async function GET(request: Request) {
  try {
    const user = await requireAccount(request);
    const db = getDatabase();
    const profile = await db.from("donor_accounts").select("id,full_name").eq("auth_user_id",user.id).maybeSingle();
    if(profile.error)throw new Error("Unable to load records.");
    if(!profile.data)return Response.json({donations:[],orders:[],subscriptions:[],activePlans:0,fullName:""},{headers:{"Cache-Control":"private, no-store"}});
    const owner=profile.data.id;
    const [donations,orders,subscriptions,active]=await Promise.all([
      db.from("donations").select("id,amount_major,currency,status,created_at,donation_interval").eq("donor_account_id",owner).order("created_at",{ascending:false}).limit(100),
      db.from("book_orders").select("id,total_ngn,status,quantity,fez_status,fez_tracking_url,created_at").eq("donor_account_id",owner).order("created_at",{ascending:false}).limit(100),
      db.from("subscriptions").select("id,subscription_code,status,next_payment_date").eq("donor_account_id",owner).order("created_at",{ascending:false}).limit(100),
      db.from("subscriptions").select("id",{head:true,count:"exact"}).eq("donor_account_id",owner).eq("status","active"),
    ]);
    if([donations,orders,subscriptions,active].some(r=>r.error))throw new Error("Unable to load records.");
    return Response.json({donations:donations.data,orders:orders.data,subscriptions:subscriptions.data,activePlans:active.count,fullName:profile.data.full_name || ""},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){const unauthorized=error instanceof Error && error.message==="Unauthorized";return Response.json({error:unauthorized?"Unauthorized":"Unable to load records."},{status:unauthorized?401:500});}
}
