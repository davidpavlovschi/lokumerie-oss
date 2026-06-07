import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Lokumerie — Garde-Manger";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [sourceCount, typeCounts] = await Promise.all([
    prisma.source.count(),
    prisma.source.groupBy({ by: ["sourceType"], _count: true }),
  ]);

  const typeLabels: Record<string, string> = {
    youtube: "YouTube",
    github: "GitHub",
    twitter: "Twitter",
    billet: "Articles",
    other: "Autres",
  };

  const topTypes = typeCounts
    .sort((a, b) => b._count - a._count)
    .slice(0, 4)
    .map((t) => `${typeLabels[t.sourceType] || t.sourceType} (${t._count})`);

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
              Garde-Manger
            </span>
          </div>
          <span style={{ fontSize: 16, color: "#6b5b4f" }}>
            {sourceCount} ressource{sourceCount !== 1 ? "s" : ""}
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
            Le Garde-Manger
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#9a8575",
              lineHeight: 1.4,
              maxWidth: "800px",
            }}
          >
            Vidéos, repos, articles et fils Twitter — les ingrédients de nos skills.
          </div>
        </div>

        {/* Bottom: type pills + branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {topTypes.map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#1c1713",
                  border: "1px solid rgba(212, 163, 115, 0.06)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                }}
              >
                <span style={{ fontSize: 14, color: "#9a8575" }}>
                  {label}
                </span>
              </div>
            ))}
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
