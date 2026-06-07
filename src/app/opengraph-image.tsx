import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Lokumerie - self-hosted private package registry for team AI know-how";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#110e0b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          gap: "60px",
        }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 48,
            background: "#d4a373",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 80px rgba(212, 163, 115, 0.22)",
          }}
        >
          <div
            style={{
              width: 176,
              height: 128,
              borderRadius: 28,
              background: "#1a1614",
              border: "6px solid rgba(245, 230, 211, 0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
            <div style={{ width: 10, height: 82, borderRadius: 8, background: "#d4a373" }} />
            <div style={{ width: 10, height: 82, borderRadius: 8, background: "#c4915f" }} />
            <div style={{ width: 10, height: 82, borderRadius: 8, background: "#4a7c59" }} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            maxWidth: "560px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#f5e6d3",
              lineHeight: 1.1,
              letterSpacing: 0,
            }}
          >
            Lokumerie
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#d4a373",
              lineHeight: 1.3,
            }}
          >
            Self-hosted private package registry for team AI know-how
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#6b5b4f",
              lineHeight: 1.5,
              marginTop: "8px",
            }}
          >
            Share prompts, Codex skills, sources, and team AI know-how from one self-hosted workspace.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
