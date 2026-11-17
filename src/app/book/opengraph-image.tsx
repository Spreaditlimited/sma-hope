import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { book } from "@/lib/book";

export const alt = "When Every Breath Matters by Tochukwu and Ijeoma Nkwocha — SMA Hope Foundation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BookImage() {
  const cover = await readFile(join(process.cwd(), "public", book.cover));
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", gap: 65, padding: "50px 80px", background: "#f7f3e9", color: "#153514" }}>
      {/* The ImageResponse renderer requires a native image element. */}
      <img src={`data:image/jpeg;base64,${cover.toString("base64")}`} width={320} height={495} alt="" />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 19, letterSpacing: 3, color: "#9c4c18", marginBottom: 24 }}>SMA HOPE FOUNDATION</div>
        <div style={{ fontSize: 65, fontWeight: 700, lineHeight: 1.06, marginBottom: 28 }}>When Every Breath Matters</div>
        <div style={{ fontSize: 25, lineHeight: 1.4, marginBottom: 24 }}>Understanding Spinal Muscular Atrophy Through Medicine, Family, Faith, and Survival</div>
        <div style={{ fontSize: 21 }}>Tochukwu &amp; Ijeoma Nkwocha</div>
        <div style={{ fontSize: 18, marginTop: 25, color: "#5c6659" }}>smahope.org/book</div>
      </div>
    </div>,
    size,
  );
}
