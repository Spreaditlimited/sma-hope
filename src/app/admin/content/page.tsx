"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminSession } from "@/lib/admin/use-admin-session";
import { adminFetch } from "@/lib/admin/client";
import type { Guide, GuideSection } from "@/content/guides";
import { topics } from "@/lib/topics";
import { isGuideDue } from "@/lib/article-publishing";
type Row = {slug:string;title:string;status:"draft"|"published";content:Guide;revision:number};
const blank = (): Guide => ({slug:"",title:"",excerpt:"",category:topics[0].name,summary:[""],sections:[{title:"",paragraphs:[""]}],checklist:[],related:[],clinical:true,updatedAt:new Date().toISOString().slice(0,10)});
export default function ContentPage() {
  const {loading,email,role}=useAdminSession();
  const [rows,setRows]=useState<Row[]>([]),[query,setQuery]=useState("");
  const [selected,setSelected]=useState<Row|null>(null),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false),[preview,setPreview]=useState(false),[dirty,setDirty]=useState(false);
  useEffect(()=>{
    if(loading)return;
    adminFetch<{rows:Row[]}>("/api/admin/content").then(r=>setRows(r.rows)).catch(()=>setError("Unable to load the content library. Refresh to retry."));
  },[loading]);
  useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue="";}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  function edit(change:Partial<Guide>){if(selected){setSelected({...selected,content:{...selected.content,...change}});setDirty(true);setNotice("");}}
  function section(index:number,change:Partial<GuideSection>){if(selected)edit({sections:selected.content.sections.map((s,i)=>i===index?{...s,...change}:s)});}
  async function save(status:"draft"|"published") {
    if(!selected)return;setBusy(true);setError("");setNotice("");
    try {
      const result=await adminFetch<Row & {ok:boolean}>("/api/admin/content",{method:"POST",body:JSON.stringify({...selected,status})});
      const row={...selected,status,revision:result.revision,content:result.content,title:result.content.title,slug:result.content.slug};
      setSelected(row);setRows(current=>[row,...current.filter(r=>r.slug!==row.slug)]);setDirty(false);
      setNotice(status === "published" ? (isGuideDue(result.content) ? "Published. The guide is now available in the knowledge hub." : `Scheduled for ${new Date(result.content.scheduledFor!).toLocaleString("en-GB", {timeZone:"Europe/London"})} UK time. The guide stays private until then.`) : "Draft saved. This guide is not visible on the public website.");
    }catch(e){setError(e instanceof Error?e.message:"Unable to save.");}finally{setBusy(false);}
  }
  const g=selected?.content;
  return <AdminShell title="Content library" subtitle="Write, preview, and publish sourced guides for Nigeria and international readers." email={email} role={role}>
    {loading?<p role="status">Checking access…</p>:<>
      {error&&<p role="alert" className="form-error">{error}</p>}
      {notice&&<p role="status" className="auth-note">{notice}</p>}
      {!selected?<>
        <div className="content-toolbar"><label>Search guides<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title or topic" /></label>
          {role==="admin"&&<button className="btn btn-primary" onClick={()=>{setSelected({slug:"",title:"",status:"draft",revision:0,content:blank()});setPreview(false);}}>Write a guide</button>}</div>
        <div className="workspace-panel content-table"><table><caption className="sr-only">Guides and publication status</caption><thead><tr><th>Guide</th><th>Topic</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {rows.filter(r=>`${r.title} ${r.content.category}`.toLowerCase().includes(query.toLowerCase())).map(row=><tr key={row.slug}><td>{row.title}</td><td>{row.content.category}</td><td>{row.status === "published" && !isGuideDue(row.content) ? `Scheduled · ${new Date(row.content.scheduledFor!).toLocaleString("en-GB", {timeZone:"Europe/London"})} UK` : row.status}</td><td><button className="text-link" onClick={()=>{setSelected(structuredClone(row));setPreview(role!=="admin");setError("");setNotice("");}}>{role==="admin"?"Edit guide":"Preview"}</button></td></tr>)}
        </tbody></table>{rows.length===0&&<p className="data-loading">No articles loaded yet.</p>}</div>
      </>:g&&<div className="content-editor">
        <div className="content-toolbar"><button className="text-link" disabled={busy||dirty} onClick={()=>{setSelected(null);setNotice("");}}>← Content library</button><span>{dirty?"Unsaved changes":`Revision ${selected.revision} · ${selected.status}`}</span><button className="btn btn-secondary" onClick={()=>setPreview(!preview)}>{preview?"Back to editor":"Preview article"}</button></div>
        {dirty&&<p className="auth-note">Save your changes before leaving the editor, or <button type="button" className="text-link" onClick={()=>{setSelected(null);setDirty(false);}}>discard changes</button>.</p>}
        {preview?<article className="guide-body content-preview"><p className="eyebrow">{g.category} · Preview</p><h2>{g.title||"Untitled guide"}</h2><p>{g.excerpt}</p>{g.intro?.map(p=><p key={p}>{p}</p>)}<ul>{g.summary.map((s,i)=><li key={i}>{s}</li>)}</ul>{g.sections.map((s,i)=><section key={i}><h3>{s.title}</h3>{s.paragraphs.map((p,j)=><p key={j}>{p}</p>)}{s.bullets&&<ul>{s.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}{s.source&&<p>Source: {s.source.title}</p>}</section>)}{Boolean(g.faqs?.length)&&<><h3>Frequently asked questions</h3>{g.faqs?.map(f=><section key={f.question}><h4>{f.question}</h4><p>{f.answer}</p></section>)}</>}<h3>Your checklist</h3><ul>{g.checklist.map((s,i)=><li key={i}>{s}</li>)}</ul></article>:
        <fieldset disabled={busy||role!=="admin"} className="editor-fields">
          <label>Title<input value={g.title} maxLength={180} onChange={e=>edit({title:e.target.value})}/></label>
          <label>URL slug<input value={g.slug} disabled={Boolean(selected.slug)} pattern="[a-z0-9-]+" onChange={e=>edit({slug:e.target.value.toLowerCase()})}/><small>Use lowercase words separated by hyphens. Existing URLs stay fixed to protect search rankings.</small></label>
          <label>Search description<textarea value={g.excerpt} maxLength={350} rows={3} onChange={e=>edit({excerpt:e.target.value})}/><small>{g.excerpt.length} characters. Explain what the reader will learn.</small></label>
          <label>Topic<select value={g.category} onChange={e=>edit({category:e.target.value})}>{topics.map(t=><option key={t.slug}>{t.name}</option>)}</select></label>
          <label>Readers / location<select value={g.audience || "Nigeria"} onChange={e=>edit({audience:e.target.value as Guide["audience"]})}>{["Nigeria","United Kingdom","Canada","United States","Africa","International"].map(country=><option key={country}>{country}</option>)}</select></label>
          <label>Direct opening — separate paragraphs with a blank line<textarea rows={5} value={g.intro?.join("\n\n") || ""} onChange={e=>edit({intro:e.target.value?e.target.value.split("\n\n"):undefined})}/></label>
          <label>Sources actually checked on<input type="date" value={g.sourcesCheckedAt || ""} max={new Date().toISOString().slice(0,10)} onChange={e=>edit({sourcesCheckedAt:e.target.value || undefined})}/><small>Use the date the linked information was checked. This does not claim clinician review.</small></label>
          <label>Verified first publication date (optional)<input type="date" value={g.publishedAt || ""} max={new Date().toISOString().slice(0,10)} onChange={e=>edit({publishedAt:e.target.value || undefined})}/><small>Leave blank if the original publication date has not been verified. Updated dates are recorded when saving.</small></label>
          <label>Scheduled publication (UTC)<input type="datetime-local" value={g.scheduledFor?.slice(0,16) || ""} onChange={e=>edit({scheduledFor:e.target.value ? `${e.target.value}:00.000Z` : undefined})}/><small>Publish at this exact time. UK time equals UTC for this November–December schedule. Leaving this blank makes Publish immediate. Save as draft to pause a scheduled guide.</small></label>
          <label>Contextual book invitation<textarea rows={4} value={g.bookContext || ""} maxLength={1500} onChange={e=>edit({bookContext:e.target.value || undefined})}/><small>Explain why this article’s reader might value the memoir. Keep clinical evidence separate.</small></label>
          <label className="editor-checkbox"><input type="checkbox" checked={g.clinical} onChange={e=>edit({clinical:e.target.checked})}/>Contains clinical information</label>
          {g.clinical&&<p className="auth-note">Add credible source links. Keep internal editorial workflow notes out of public article text. Do not claim credentials or approval that have not been verified.</p>}
          <label>Key takeaways — one per line<textarea rows={4} value={g.summary.join("\n")} onChange={e=>edit({summary:e.target.value.split("\n")})}/></label>
          {g.sections.map((s,i)=><section className="editor-section" key={i}><div className="content-toolbar"><h2>Section {i+1}</h2>{g.sections.length>1&&<button type="button" className="text-link" onClick={()=>edit({sections:g.sections.filter((_,j)=>j!==i)})}>Remove section</button>}</div>
            <label>Heading<input value={s.title} onChange={e=>section(i,{title:e.target.value})}/></label>
            <label>Body — separate paragraphs with a blank line<textarea rows={8} value={s.paragraphs.join("\n\n")} onChange={e=>section(i,{paragraphs:e.target.value.split("\n\n")})}/></label>
            <label>Bullet points — one per line (optional)<textarea rows={3} value={s.bullets?.join("\n")||""} onChange={e=>section(i,{bullets:e.target.value?e.target.value.split("\n"):undefined})}/></label>
            {s.links&&<div><h3>Section links</h3>{s.links.map((link,li)=><div key={li}><label>Link label<input value={link.label} onChange={e=>section(i,{links:s.links?.map((l,n)=>n===li?{...l,label:e.target.value}:l)})}/></label><label>Destination<input value={link.href} onChange={e=>section(i,{links:s.links?.map((l,n)=>n===li?{...l,href:e.target.value}:l)})}/></label></div>)}</div>}
            {s.table&&<div><h3>Planning table</h3>{s.table.columns.map((column,col)=><label key={col}>Column {col+1}<input value={column} onChange={e=>section(i,{table:{...s.table!,columns:s.table!.columns.map((c,n)=>n===col?e.target.value:c)}})}/></label>)}{s.table.rows.map((row,ri)=><div key={ri}>{row.map((cell,ci)=><label key={ci}>Row {ri+1}, {s.table!.columns[ci]}<input value={cell} onChange={e=>section(i,{table:{...s.table!,rows:s.table!.rows.map((r,n)=>n===ri?r.map((c,m)=>m===ci?e.target.value:c):r)}})}/></label>)}</div>)}</div>}
            <label>Source title<input value={s.source?.title||""} onChange={e=>section(i,{source:{title:e.target.value,url:s.source?.url||""}})}/></label>
            <label>Source URL<input type="url" value={s.source?.url||""} placeholder="https://" onChange={e=>section(i,{source:{title:s.source?.title||"",url:e.target.value}})}/></label>
            {s.source&&<button type="button" className="text-link" onClick={()=>section(i,{source:undefined})}>Remove source</button>}
          </section>)}
          <button type="button" className="btn btn-secondary" onClick={()=>edit({sections:[...g.sections,{title:"",paragraphs:[""]}]})}>Add section</button>
          <h2>Frequently asked questions</h2>
          {(g.faqs || []).map((faq,index)=><section className="editor-section" key={index}>
            <label>Question<input maxLength={250} value={faq.question} onChange={e=>edit({faqs:g.faqs?.map((f,i)=>i===index?{...f,question:e.target.value}:f)})}/></label>
            <label>Answer<textarea rows={4} maxLength={3000} value={faq.answer} onChange={e=>edit({faqs:g.faqs?.map((f,i)=>i===index?{...f,answer:e.target.value}:f)})}/></label>
            <label>Source title (optional)<input value={faq.source?.title || ""} onChange={e=>edit({faqs:g.faqs?.map((f,i)=>i===index?{...f,source:{title:e.target.value,url:f.source?.url || ""}}:f)})}/></label>
            <label>Source URL (optional)<input type="url" value={faq.source?.url || ""} onChange={e=>edit({faqs:g.faqs?.map((f,i)=>i===index?{...f,source:{title:f.source?.title || "",url:e.target.value}}:f)})}/></label>
            {faq.source&&<button type="button" className="text-link" onClick={()=>edit({faqs:g.faqs?.map((f,i)=>i===index?{...f,source:undefined}:f)})}>Remove FAQ source</button>}
            <button type="button" className="text-link" onClick={()=>edit({faqs:g.faqs?.filter((_,i)=>i!==index)})}>Remove question</button>
          </section>)}
          <button type="button" className="btn btn-secondary" disabled={(g.faqs?.length || 0)>=15} onClick={()=>edit({faqs:[...(g.faqs || []),{question:"",answer:""}]})}>Add question</button>
          <label>Practical checklist — one item per line<textarea rows={5} value={g.checklist.join("\n")} onChange={e=>edit({checklist:e.target.value?e.target.value.split("\n"):[]})}/></label>
          <label>Related guide slugs — one per line<textarea rows={3} value={g.related.join("\n")} onChange={e=>edit({related:e.target.value?e.target.value.split("\n"):[]})}/></label>
        </fieldset>}
        {role==="admin"&&<div className="editor-actions"><button disabled={busy} className="btn btn-secondary" onClick={()=>save("draft")}>{selected.status==="published"?"Save as draft & unpublish":"Save draft"}</button><button disabled={busy} className="btn btn-primary" onClick={()=>save("published")}>{busy?"Saving…":!isGuideDue(g)?"Schedule guide":"Publish guide"}</button>{selected.status==="published"&&isGuideDue(g)&&selected.slug&&<Link href={`/blog/${selected.slug}`} target="_blank">View live guide ↗</Link>}</div>}
      </div>}
    </>}
  </AdminShell>;
}
