"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountWorkspaceShell } from "@/components/account/workspace-shell";
import { accountData } from "@/lib/auth/client";
import { useAccountSession } from "@/lib/auth/use-account-session";
import { formatMoney, displayDate } from "@/lib/dashboard";
type Order = {id:string;quantity:number;total_ngn:number;status:string;fez_status:string|null;fez_tracking_url:string|null;created_at:string};
export default function OrdersPage() {
 const {loading,email}=useAccountSession();
 const [rows,setRows]=useState<Order[]|null>(null),[error,setError]=useState("");
 useEffect(()=>{
  if(loading)return;let cancelled=false;
  accountData().then(data=>{if(!cancelled)setRows(data.orders);}).catch(()=>{if(!cancelled)setError("Unable to load your orders. Please refresh and try again.");});
  return()=>{cancelled=true;};
 },[loading]);
 return <AccountWorkspaceShell title="Book orders" subtitle="Your purchase and delivery history." email={email}>
  <div className="workspace-panel" style={{padding:28,marginBottom:28}}><h2>Stay close to the story.</h2><p style={{marginBlock:16}}>The book is not yet released. Join the interest list for updates; any existing orders remain listed below.</p><Link href="/book#book-interest" className="btn btn-primary">Get book updates</Link></div>
  {error?<p role="alert" className="form-error">{error}</p>:loading||rows===null?<p role="status">Loading your orders…</p>:rows.length===0?<div className="workspace-panel" style={{padding:28}}><h2>No orders yet.</h2><p>Your book orders will appear here.</p></div>:<div className="workspace-panel content-table"><table><caption className="sr-only">Your latest 100 book orders</caption><thead><tr><th>Date</th><th>Copies</th><th>Total</th><th>Payment</th><th>Delivery</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{displayDate(row.created_at)}</td><td>{row.quantity}</td><td>{formatMoney(row.total_ngn,"NGN")}</td><td>{row.status}</td><td>{row.fez_status||"Awaiting update"}{row.fez_tracking_url?.startsWith("https://")&&<> · <a href={row.fez_tracking_url} target="_blank" rel="noopener noreferrer">Track parcel ↗</a></>}</td></tr>)}</tbody></table></div>}
 </AccountWorkspaceShell>;
}
