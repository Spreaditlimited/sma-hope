import { NextResponse } from "next/server";
import { sendTransactionalEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type Payload = {
  email?: string;
};

function appOrigin(request: Request) {
  const configured = env.siteUrl.replace(/\/$/, "");
  if (configured && !configured.includes("localhost")) return configured;

  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

  return url.origin;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Payload | null;
  const email = String(payload?.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Valid email is required." }, { status: 400 });
  }

  const origin = appOrigin(request);
  const resetPath = "/account/reset-password";
  const fallbackResetUrl = `${origin}${resetPath}`;

  try {
    const admin = getSupabaseAdminClient();
    const recovery = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: fallbackResetUrl,
      },
    });

    const resetLink = recovery.data?.properties?.action_link;

    if (recovery.error || !resetLink) {
      console.info("Password reset requested for unknown or unavailable account.", {
        email,
        error: recovery.error?.message,
      });
      return NextResponse.json({ ok: true });
    }

    await sendTransactionalEmail({
      to: email,
      subject: "Reset your SMA Hope password",
      text: [
        "We received a request to reset your SMA Hope account password.",
        "",
        "Open this secure link to choose a new password:",
        resetLink,
        "",
        "If you did not request this, you can ignore this email.",
        "",
        `Sign in: ${origin}/account/login`,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json({ ok: false, error: "Unable to send reset link." }, { status: 500 });
  }
}
