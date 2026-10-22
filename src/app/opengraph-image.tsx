import { ImageResponse } from "next/og";
export const alt = "SMA Hope Foundation Nigeria — Understanding SMA. Standing with families.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#f4f3eb",
          padding: "65px 75px",
          color: "#203b42",
          borderBottom: "18px solid #174e60",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#56735f" }}>
          SMA HOPE FOUNDATION / NIGERIA
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 73,
            lineHeight: 1.1,
            letterSpacing: -3,
          }}
        >
          <span>Understanding SMA.</span>
          <span style={{ color: "#52785f" }}>Standing with families.</span>
        </div>
        <div style={{ display: "flex", fontSize: 23, color: "#65786a" }}>
          Clear information. Practical support. A shared hope.
        </div>
      </div>
    ),
    size,
  );
}
