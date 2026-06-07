import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Lokumerie — Skills";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [skillCount, authorCount] = await Promise.all([
    prisma.skill.count({ where: { published: true } }),
    prisma.user.count(),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#110e0b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
        }}
      >
        {/* Top: category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(212, 163, 115, 0.08)",
              border: "1px solid rgba(212, 163, 115, 0.15)",
              borderRadius: "999px",
              padding: "6px 16px",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "#d4a373", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Étalage
            </span>
          </div>
          <span style={{ fontSize: 16, color: "#6b5b4f" }}>
            {skillCount} skills · {authorCount} artisan{authorCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Center: title + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#f5e6d3",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Les Lokums
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#9a8575",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            Des skills Claude Code artisanaux, cuits au four et prêts à installer.
          </div>
        </div>

        {/* Bottom: install hint + branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#1c1713",
              border: "1px solid rgba(212, 163, 115, 0.06)",
              borderRadius: "12px",
              padding: "12px 20px",
            }}
          >
            <span style={{ fontSize: 16, color: "#6b5b4f" }}>$</span>
            <span style={{ fontSize: 16, color: "#9a8575", fontFamily: "monospace" }}>
              lokum search
            </span>
            <span style={{ fontSize: 16, color: "#d4a373", fontFamily: "monospace" }}>
              &lt;query&gt;
            </span>
          </div>
          <span style={{ fontSize: 18, color: "#6b5b4f" }}>
            Lokumerie
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
