import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    type: "book",
    provider: "paystack",
    message: "Book checkout endpoint scaffold is ready.",
  });
}
