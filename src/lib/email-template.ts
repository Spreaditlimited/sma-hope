export type EmailDesign = {
  heading?: string;
  eyebrow?: string;
  action?: { label: string; url: string };
  note?: { title: string; text: string };
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safeUrl(value: string) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function linkify(value: string) {
  return value.split(/(https?:\/\/[^\s<>"']+)/g).map(part => {
    const url = /^https?:\/\//.test(part) ? safeUrl(part) : null;
    return url ? `<a class="email-link" href="${escapeHtml(url)}" style="color:#174e60;text-decoration:underline;word-break:break-all;">${escapeHtml(part)}</a>` : escapeHtml(part);
  }).join("");
}
function bodyHtml(text: string) {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [], details: {label:string;value:string}[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p class="email-copy" style="margin:0 0 20px;color:#53645f;font-size:17px;line-height:1.65;overflow-wrap:anywhere;">${paragraph.map(linkify).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushDetails = () => {
    if (details.length) blocks.push(`<table role="presentation" class="email-muted" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#e8eee4;border-radius:8px;table-layout:fixed;">${details.map(pair => `<tr><td class="email-copy email-border" width="38%" valign="top" style="padding:12px 16px;border-bottom:1px solid #dce3d8;color:#53645f;font-size:14px;word-break:break-word;">${escapeHtml(pair.label)}</td><td class="email-ink email-border" valign="top" style="padding:12px 16px;border-bottom:1px solid #dce3d8;color:#183747;font-size:15px;word-break:break-word;">${linkify(pair.value)}</td></tr>`).join("")}</table>`);
    details = [];
  };
  for (const line of lines) {
    if (!line.trim()) { flushParagraph(); flushDetails(); continue; }
    const pair = line.match(/^([A-Za-z][A-Za-z \-]{1,47}):\s+(.+)$/);
    if (pair) { flushParagraph(); details.push({label:pair[1],value:pair[2]}); }
    else { flushDetails(); paragraph.push(line); }
  }
  flushParagraph(); flushDetails();
  return blocks.join("");
}

/** Table layout and inline light styles remain usable when a mail client strips CSS. */
export function renderEmailTemplate(input: { subject: string; text: string; siteUrl?: string; design?: EmailDesign }) {
  const origin = safeUrl(input.siteUrl || "https://www.smahope.org") || "https://www.smahope.org";
  const site = new URL(origin).origin;
  const design = input.design || {};
  const actionUrl = design.action && safeUrl(design.action.url);
  const body = actionUrl ? input.text.split("\n").filter(line => line.trim() !== actionUrl && !/^(Dashboard|SMA Hope order dashboard):\s+https?:\/\//.test(line)).join("\n") : input.text;
  const preheader = input.text.split("\n").find(line => line.trim()) || input.subject;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeHtml(input.subject)}</title>
<style>
  :root { color-scheme:light dark;supported-color-schemes:light dark; }
  body { margin:0;padding:0;-webkit-text-size-adjust:100%; }
  table { mso-table-lspace:0;mso-table-rspace:0; }
  td,p,a { font-family:Arial,Helvetica,sans-serif; }
  a[x-apple-data-detectors] { color:inherit!important; }
  .email-logo-dark { display:none;max-height:0;overflow:hidden;mso-hide:all; }
  @media(max-width:480px) { .email-outer{padding:20px 10px!important}.email-pad{padding:26px 22px!important}.email-heading{font-size:32px!important}.email-button{display:block!important;text-align:center!important} }
  @media(prefers-color-scheme:dark) {
    .email-canvas { background:#101b1b!important; }
    .email-surface { background:#192827!important; }
    .email-muted { background:#283d34!important; }
    .email-ink { color:#edf3ef!important; }
    .email-copy { color:#b7c5be!important; }
    .email-border { border-color:#3c5047!important; }
    .email-link { color:#c2dfd3!important; }
    .email-button,.email-button-cell { background:#dce9df!important;color:#183747!important;border-color:#dce9df!important; }
    .email-logo-light { display:none!important;max-height:0!important;overflow:hidden!important; }
    .email-logo-dark { display:block!important;max-height:none!important;overflow:visible!important; }
  }
  [data-ogsc] .email-ink { color:#edf3ef!important; }
  [data-ogsc] .email-copy { color:#b7c5be!important; }
  [data-ogsc] .email-link { color:#c2dfd3!important; }
  [data-ogsc] .email-surface { background:#192827!important; }
  [data-ogsc] .email-muted { background:#283d34!important; }
  [data-ogsc] .email-canvas { background:#101b1b!important; }
  [data-ogsc] .email-logo-light { display:none!important; }
  [data-ogsc] .email-logo-dark { display:block!important;max-height:none!important;overflow:visible!important; }
</style></head>
<body class="email-canvas" style="background:#f2f0e9;margin:0;padding:0;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" class="email-canvas" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f0e9;"><tr><td class="email-outer" align="center" style="padding:36px 16px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" class="email-surface email-border" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fffdf8;border:1px solid #dce3d8;border-radius:16px;border-spacing:0;overflow:hidden;">
<tr><td class="email-pad email-border" style="padding:26px 36px;border-bottom:1px solid #dce3d8;">
<a href="${escapeHtml(site)}" style="text-decoration:none;">
<img class="email-logo-light" src="${escapeHtml(site)}/SMA%20Hope%20Foundation%20logo.png" width="140" alt="SMA Hope Foundation" style="display:block;width:140px;max-width:100%;height:auto;border:0;color:#183747;font-size:16px;">
<!--[if !mso]><!--><img class="email-logo-dark" src="${escapeHtml(site)}/sma-hope-logo-dark.png" width="140" alt="SMA Hope Foundation" style="display:none;max-height:0;overflow:hidden;width:140px;height:auto;border:0;mso-hide:all;color:#edf3ef;font-size:16px;"><!--<![endif]-->
</a></td></tr>
<tr><td class="email-pad" style="padding:36px;">
<p class="email-copy" style="margin:0 0 16px;color:#53645f;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(design.eyebrow || "SMA Hope Foundation")}</p>
<h1 class="email-heading email-ink" style="margin:0 0 26px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.15;font-weight:400;letter-spacing:-1px;color:#183747;">${escapeHtml(design.heading || input.subject)}</h1>
${bodyHtml(body)}
${actionUrl ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 26px;"><tr><td class="email-button-cell" bgcolor="#183747" style="border-radius:8px;background:#183747;"><a class="email-button" href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:15px 25px;border:1px solid #183747;border-radius:8px;background:#183747;color:#fff;font-size:16px;font-weight:600;line-height:1.4;text-decoration:none;">${escapeHtml(design.action!.label)} &nbsp;→</a></td></tr></table><p class="email-copy" style="margin:0 0 24px;color:#53645f;font-size:13px;line-height:1.6;">If the button doesn’t work, <a class="email-link" href="${escapeHtml(actionUrl)}" style="color:#174e60;word-break:break-all;">open this link</a> or copy it into your browser:<br><span style="word-break:break-all;">${escapeHtml(actionUrl)}</span></p>` : ""}
${design.note ? `<table role="presentation" class="email-muted" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 27px;background:#e8eee4;border-radius:10px;"><tr><td style="padding:19px 21px;"><p class="email-ink" style="margin:0 0 5px;font-size:15px;line-height:1.65;color:#183747;font-weight:600;">${escapeHtml(design.note.title)}</p><p class="email-copy" style="margin:0;font-size:15px;line-height:1.65;color:#53645f;">${escapeHtml(design.note.text)}</p></td></tr></table>` : ""}
<p class="email-ink" style="margin:0;color:#183747;font-size:16px;line-height:1.7;">With care,<br><strong>The SMA Hope team</strong></p>
</td></tr>
<tr><td class="email-muted email-pad" style="padding:25px 36px;background:#e8eee4;">
<p class="email-ink" style="margin:0 0 9px;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.4;color:#183747;">Hope. Support. A way forward.</p>
<p class="email-copy" style="margin:0 0 14px;color:#53645f;font-size:14px;line-height:1.7;">Standing alongside families affected by spinal muscular atrophy in Nigeria.</p>
<p style="margin:0;font-size:14px;line-height:1.7;"><a class="email-link" href="${escapeHtml(site)}" style="color:#174e60;">Visit SMA Hope</a> &nbsp;·&nbsp; <a class="email-link" href="mailto:help@smahope.org" style="color:#174e60;">Get in touch</a></p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
<p class="email-copy" style="max-width:530px;margin:18px auto 0;color:#53645f;text-align:center;font-size:12px;line-height:1.7;">SMA Hope Foundation · Lagos, Nigeria<br>You received this email because of activity connected to SMA Hope Foundation.</p>
</td></tr></table></body></html>`;
}
