import { env } from "@/lib/env";
import nodemailer, { type Transporter } from "nodemailer";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const to = input.to.trim().toLowerCase();
  const usePartnershipMailbox = to === env.partnershipsEmailAddress.trim().toLowerCase();

  const smtpUser = usePartnershipMailbox ? env.partnershipsEmailAddress : env.helpEmailAddress;
  const smtpPass = usePartnershipMailbox ? env.partnershipsEmailPassword : env.helpEmailPassword;

  if (!smtpUser || !smtpPass) {
    console.info("SMTP mailbox not configured, skipping send.", { to: input.to });
    return { ok: true, skipped: true };
  }

  const transporter: Transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const html = renderEmailTemplate({
    subject: input.subject,
    text: input.text,
  });

  await transporter.sendMail({
    from: `"SMA Hope Foundation" <${smtpUser}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  });

  return { ok: true, skipped: false };
}

const THEME = {
  colors: {
    primary: "#0284c7",
    primaryDark: "#0369a1",
    bgCanvas: "#f8fafc",
    bgSurface: "#ffffff",
    bgMuted: "#f1f5f9",
    textMain: "#334155",
    textMuted: "#64748b",
    textInverse: "#ffffff",
    border: "#e2e8f0",
  },
  fonts: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  layout: {
    maxWidth: 600,
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linkify(value: string): string {
  const escaped = escapeHtml(value);
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return escaped.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" style="color:${THEME.colors.primary}; text-decoration:underline; font-weight:600; word-break:break-word;">${url}</a>`,
  );
}

function parseLabelValue(line: string): { label: string; value: string } | null {
  const match = line.match(/^([^:\n]{2,48}):\s+(.+)$/);
  return match ? { label: match[1].trim(), value: match[2].trim() } : null;
}

function parseButtonIntent(line: string): { url: string; label: string } | null {
  const match = line.match(/https?:\/\/[^\s<]+/);
  if (!match) return null;

  const url = match[0];
  const lower = line.toLowerCase();

  let label = "View Details";
  if (lower.includes("tracking")) label = "Track Shipment";
  else if (lower.includes("dashboard")) label = "Open Dashboard";
  else if (lower.includes("reset")) label = "Reset Password";
  else if (lower.includes("sign in") || lower.includes("login")) label = "Sign In";

  return { url, label };
}

function renderButton({ url, label }: { url: string; label: string }): string {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="border-radius:6px; background-color:${THEME.colors.primary};">
        <a href="${escapeHtml(url)}" target="_blank" style="font-size:15px; font-family:${THEME.fonts.sans}; color:${THEME.colors.textInverse}; text-decoration:none; padding:12px 24px; border:1px solid ${THEME.colors.primary}; border-radius:6px; display:inline-block; font-weight:600; letter-spacing:0.02em;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

function renderDetailsTable(lines: string[]): string {
  const rows = lines
    .map((line) => {
      const pair = parseLabelValue(line);
      if (!pair) return "";
      return `
      <tr>
        <td width="35%" valign="top" style="padding:12px 16px; border-bottom:1px solid ${THEME.colors.border}; color:${THEME.colors.textMuted}; font-family:${THEME.fonts.sans}; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">
          ${escapeHtml(pair.label)}
        </td>
        <td valign="top" style="padding:12px 16px; border-bottom:1px solid ${THEME.colors.border}; color:${THEME.colors.textMain}; font-family:${THEME.fonts.sans}; font-size:14px; font-weight:500; word-break:break-word;">
          ${linkify(pair.value)}
        </td>
      </tr>`;
    })
    .filter(Boolean)
    .join("");

  return rows
    ? `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 24px; border:1px solid ${THEME.colors.border}; border-bottom:none; border-radius:8px; background-color:${THEME.colors.bgMuted}; overflow:hidden;">
    ${rows}
  </table>
  `
    : "";
}

function renderBodyBlocks(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").filter((line) => line.trim());

      if (lines.length > 0 && lines.every((line) => parseLabelValue(line) !== null)) {
        return renderDetailsTable(lines);
      }

      if (lines.length === 1) {
        const buttonIntent = parseButtonIntent(lines[0]);
        if (buttonIntent) return renderButton(buttonIntent);
      }

      return `<p style="margin:0 0 16px; color:${THEME.colors.textMain}; font-family:${THEME.fonts.sans}; font-size:16px; line-height:1.6;">
      ${lines.map(linkify).join("<br>")}
    </p>`;
    })
    .join("");
}

export function renderEmailTemplate(input: { subject: string; text: string }): string {
  const siteUrl = typeof env !== "undefined" && env.siteUrl ? env.siteUrl.replace(/\/$/, "") : "";
  const preheader = escapeHtml(input.text.split("\n").find((line) => line.trim()) || input.subject);

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(input.subject)}</title>
  <style>
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td, p, a { font-family: ${THEME.fonts.sans}; }
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: ${THEME.colors.bgCanvas}; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  </style>
</head>
<body style="background-color:${THEME.colors.bgCanvas}; margin:0; padding:0; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; font-size:1px; line-height:1px; mso-hide:all;">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${THEME.colors.bgCanvas};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:${THEME.layout.maxWidth}px; background-color:${THEME.colors.bgSurface}; border:1px solid ${THEME.colors.border}; border-radius:12px; overflow:hidden; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background-color:${THEME.colors.primaryDark}; padding:32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td valign="middle">
                    <p style="margin:0; color:#bae6fd; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">SMA Hope Foundation</p>
                    <h1 style="margin:8px 0 0; color:${THEME.colors.textInverse}; font-size:24px; line-height:1.3; font-weight:700;">${escapeHtml(input.subject)}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding:40px;">
              ${renderBodyBlocks(input.text)}
            </td>
          </tr>
          
          <tr>
            <td style="padding:24px 40px; background-color:${THEME.colors.bgMuted}; border-top:1px solid ${THEME.colors.border};">
              <p style="margin:0 0 4px; color:${THEME.colors.textMain}; font-size:14px; font-weight:700;">SMA Hope Foundation</p>
              <p style="margin:0; color:${THEME.colors.textMuted}; font-size:13px; line-height:1.5;">
                Awareness, advocacy, and practical support for families affected by Spinal Muscular Atrophy.
                ${siteUrl ? `<br><a href="${siteUrl}" style="color:${THEME.colors.primary}; text-decoration:none; font-weight:600; display:inline-block; margin-top:4px;">${siteUrl.replace(/^https?:\/\//, "")}</a>` : ""}
              </p>
            </td>
          </tr>

        </table>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:${THEME.layout.maxWidth}px;">
          <tr>
            <td align="center" style="padding-top:24px; color:#94a3b8; font-size:12px; line-height:1.5; font-family:${THEME.fonts.sans};">
              You received this message because of activity connected to SMA Hope Foundation.
            </td>
          </tr>
        </table>

        </td>
    </tr>
  </table>
</body>
</html>`;
}
