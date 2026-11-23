import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Project One Million — structured SMA education for one million families, 2027–2031";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProjectImage() {
  const logo = await readFile(join(process.cwd(), "public", "SMA Hope Foundation logo.png"));
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "48px 66px", background: "#fbfaf7", color: "#203b42", borderTop: "10px solid #b78b43" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 38 }}>
        <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={180} height={95} />
        <div style={{ display: "flex", fontSize: 22, color: "#5d6d70" }}>THE FIVE-YEAR AMBITION · 2027–2031</div>
      </div>
      <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.15, marginBottom: 18 }}>Project One Million</div>
      <div style={{ display: "flex", fontSize: 34, lineHeight: 1.4, maxWidth: 900 }}>One million families. More understanding. Better access to care.</div>
      <div style={{ display: "flex", marginTop: "auto", paddingTop: 30, borderTop: "1px solid #dce2dd", justifyContent: "space-between", alignItems: "center", fontSize: 22 }}>
        <div style={{ display: "flex", color: "#174e60" }}>SMA education · Testing · Family support · Care</div>
        <div style={{ display: "flex" }}>smahope.org</div>
      </div>
    </div>, size,
  );
}
