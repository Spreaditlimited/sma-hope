"use client";
import { type FormEvent, useRef, useState, useId } from "react";
type Props = { inline?:boolean;buttonLabel?:string;buttonClassName?:string;disabledButtonLabel?:string;disabledButtonClassName?:string;disabledButtonFullWidth?:boolean };
export function BookPreorderSignup({inline=false,buttonLabel="Join the interest list",buttonClassName="btn btn-primary",disabledButtonLabel}:Props) {
  const dialog=useRef<HTMLDialogElement>(null);
  const id=useId();
  const [isSubmitting,setIsSubmitting]=useState(false),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState(false);
  const [formStartedAt,setFormStartedAt]=useState(()=>Date.now());
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      formStartedAt,
    };

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(json?.error || "Unable to join the email list right now.");
        return;
      }

      form.reset();
      setFormStartedAt(Date.now());
      setSuccess(true);
    } catch {
      setError("Unable to join the email list right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const form=<form className="interest-form" onSubmit={handleSubmit}>
    <p>Leave your details for news about <em>When Every Breath Matters</em>. The book is not yet released.</p>
    <label htmlFor={`${id}-name`}>Your name<input id={`${id}-name`} name="name" autoComplete="name" required /></label>
    <label htmlFor={`${id}-email`}>Email address<input id={`${id}-email`} name="email" type="email" autoComplete="email" required /></label>
    <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{display:"none"}} />
    {error&&<p className="form-error" role="alert">{error}</p>}
    {success&&<p role="status" className="auth-note">Thank you. You’re on the interest list. We’ll share news when pre-orders open.</p>}
    <button className="btn btn-primary" disabled={isSubmitting||success}>{isSubmitting?"Joining…":success?"You’re on the list":"Keep me updated"}</button>
    <small>By joining, you agree to receive book updates. You can unsubscribe at any time.</small>
  </form>;
  if(inline)return form;
  return <><button type="button" className={buttonClassName} onClick={()=>{setFormStartedAt(Date.now());dialog.current?.showModal();}}>{disabledButtonLabel||buttonLabel}</button>
    <dialog ref={dialog} className="interest-dialog" aria-labelledby={`${id}-title`}><div className="content-toolbar"><h2 id={`${id}-title`}>Book updates</h2><button type="button" className="text-link" onClick={()=>dialog.current?.close()} aria-label="Close book updates">Close ×</button></div>{form}</dialog>
  </>;
}
