"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminSession } from "@/lib/admin/use-admin-session";
import { adminFetch } from "@/lib/admin/client";
import type { Guide, GuideSection } from "@/content/guides";
import { topics } from "@/lib/topics";
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
      setNotice(status==="published"?"Published. The guide is now available in the knowledge hub.":"Draft saved. This guide is not visible on the public website.");
    }catch(e){setError(e instanceof Error?e.message:"Unable to save.");}finally{setBusy(false);}
  }
  const g=selected?.content;
  return <AdminShell title="Content library" subtitle="Write, preview, and publish practical guides for Nigerian families." email={email} role={role}>
    {loading?<p role="status">Checking access…</p>:<>
      {error&&<p role="alert" className="form-error">{error}</p>}
      {notice&&<p role="status" className="auth-note">{notice}</p>}
      {!selected?<>
        <div className="content-toolbar"><label>Search guides<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title or topic" /></label>
          {role==="admin"&&<button className="btn btn-primary" onClick={()=>{setSelected({slug:"",title:"",status:"draft",revision:0,content:blank()});setPreview(false);}}>Write a guide</button>}</div>
        <div className="workspace-panel content-table"><table><caption className="sr-only">Guides and publication status</caption><thead><tr><th>Guide</th><th>Topic</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {rows.filter(r=>`${r.title} ${r.content.category}`.toLowerCase().includes(query.toLowerCase())).map(row=><tr key={row.slug}><td>{row.title}</td><td>{row.content.category}</td><td>{row.status}</td><td><button className="text-link" onClick={()=>{setSelected(structuredClone(row));setPreview(role!=="admin");setError("");setNotice("");}}>{role==="admin"?"Edit guide":"Preview"}</button></td></tr>)}
        </tbody></table>{rows.length===0&&<p className="data-loading">No articles loaded yet.</p>}</div>
      </>:g&&<div className="content-editor">
        <div className="content-toolbar"><button className="text-link" disabled={busy||dirty} onClick={()=>{setSelected(null);setNotice("");}}>← Content library</button><span>{dirty?"Unsaved changes":`Revision ${selected.revision} · ${selected.status}`}</span><button className="btn btn-secondary" onClick={()=>setPreview(!preview)}>{preview?"Back to editor":"Preview article"}</button></div>
        {dirty&&<p className="auth-note">Save your changes before leaving the editor, or <button type="button" className="text-link" onClick={()=>{setSelected(null);setDirty(false);}}>discard changes</button>.</p>}
        {preview?<article className="guide-body content-preview"><p className="eyebrow">{g.category} · Preview</p><h2>{g.title||"Untitled guide"}</h2><p>{g.excerpt}</p><ul>{g.summary.map((s,i)=><li key={i}>{s}</li>)}</ul>{g.sections.map((s,i)=><section key={i}><h3>{s.title}</h3>{s.paragraphs.map((p,j)=><p key={j}>{p}</p>)}{s.bullets&&<ul>{s.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}{s.source&&<p>Source: {s.source.title}</p>}</section>)}<h3>Your checklist</h3><ul>{g.checklist.map((s,i)=><li key={i}>{s}</li>)}</ul></article>:
        <fieldset disabled={busy||role!=="admin"} className="editor-fields">
          <label>Title<input value={g.title} maxLength={180} onChange={e=>edit({title:e.target.value})}/></label>
          <label>URL slug<input value={g.slug} disabled={Boolean(selected.slug)} pattern="[a-z0-9-]+" onChange={e=>edit({slug:e.target.value.toLowerCase()})}/><small>Use lowercase words separated by hyphens. Existing URLs stay fixed to protect search rankings.</small></label>
          <label>Search description<textarea value={g.excerpt} maxLength={350} rows={3} onChange={e=>edit({excerpt:e.target.value})}/><small>{g.excerpt.length} characters. Explain what the reader will learn.</small></label>
          <label>Topic<select value={g.category} onChange={e=>edit({category:e.target.value})}>{topics.map(t=><option key={t.slug}>{t.name}</option>)}</select></label>
          <label className="editor-checkbox"><input type="checkbox" checked={g.clinical} onChange={e=>edit({clinical:e.target.checked})}/>Contains clinical information</label>
          {g.clinical&&<p className="auth-note">Clinical articles display “Clinical review pending”. Add credible source links. Do not claim medical review that has not taken place.</p>}
          <label>Key takeaways — one per line<textarea rows={4} value={g.summary.join("\n")} onChange={e=>edit({summary:e.target.value.split("\n")})}/></label>
          {g.sections.map((s,i)=><section className="editor-section" key={i}><div className="content-toolbar"><h2>Section {i+1}</h2>{g.sections.length>1&&<button type="button" className="text-link" onClick={()=>edit({sections:g.sections.filter((_,j)=>j!==i)})}>Remove section</button>}</div>
            <label>Heading<input value={s.title} onChange={e=>section(i,{title:e.target.value})}/></label>
            <label>Body — separate paragraphs with a blank line<textarea rows={8} value={s.paragraphs.join("\n\n")} onChange={e=>section(i,{paragraphs:e.target.value.split("\n\n")})}/></label>
            <label>Bullet points — one per line (optional)<textarea rows={3} value={s.bullets?.join("\n")||""} onChange={e=>section(i,{bullets:e.target.value?e.target.value.split("\n"):undefined})}/></label>
            <label>Source title<input value={s.source?.title||""} onChange={e=>section(i,{source:{title:e.target.value,url:s.source?.url||""}})}/></label>
            <label>Source URL<input type="url" value={s.source?.url||""} placeholder="https://" onChange={e=>section(i,{source:{title:s.source?.title||"",url:e.target.value}})}/></label>
            {s.source&&<button type="button" className="text-link" onClick={()=>section(i,{source:undefined})}>Remove source</button>}
          </section>)}
          <button type="button" className="btn btn-secondary" onClick={()=>edit({sections:[...g.sections,{title:"",paragraphs:[""]}]})}>Add section</button>
          <label>Practical checklist — one item per line<textarea rows={5} value={g.checklist.join("\n")} onChange={e=>edit({checklist:e.target.value?e.target.value.split("\n"):[]})}/></label>
          <label>Related guide slugs — one per line<textarea rows={3} value={g.related.join("\n")} onChange={e=>edit({related:e.target.value?e.target.value.split("\n"):[]})}/></label>
        </fieldset>}
        {role==="admin"&&<div className="editor-actions"><button disabled={busy} className="btn btn-secondary" onClick={()=>save("draft")}>{selected.status==="published"?"Save as draft & unpublish":"Save draft"}</button><button disabled={busy} className="btn btn-primary" onClick={()=>save("published")}>{busy?"Saving…":"Publish guide"}</button>{selected.status==="published"&&selected.slug&&<Link href={`/blog/${selected.slug}`} target="_blank">View live guide ↗</Link>}</div>}
      </div>}
    </>}
  </AdminShell>;
}
