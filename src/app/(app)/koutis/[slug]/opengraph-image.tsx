import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Lokumerie — Kouti Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const kouti = await prisma.kouti.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      author: { select: { name: true } },
      skills: {
        orderBy: { position: "asc" },
        include: { skill: { select: { name: true, slug: true, flavor: true } } },
      },
    },
  });

  if (!kouti) {
    return new ImageResponse(
      <div style={{ background: "#110e0b", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b5b4f", fontSize: 32 }}>
        Kouti not found
      </div>,
      { ...size }
    );
  }

  const skillCount = kouti.skills.length;
  const description = kouti.description || "";

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
        {/* Top: box badge + author */}
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
              Kouti
            </span>
            <span style={{ fontSize: 14, color: "#6b5b4f" }}>
              · {skillCount} skill{skillCount !== 1 ? "s" : ""}
            </span>
          </div>
          <span style={{ fontSize: 16, color: "#6b5b4f" }}>
            par {kouti.author.name}
          </span>
        </div>

        {/* Center: title + description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#f5e6d3",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {kouti.name}
          </div>
          {description && (
            <div
              style={{
                fontSize: 24,
                color: "#9a8575",
                lineHeight: 1.4,
                maxWidth: "900px",
              }}
            >
              {description.length > 140 ? description.slice(0, 137) + "..." : description}
            </div>
          )}
        </div>

        {/* Bottom: skill pills + branding */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", maxWidth: "900px" }}>
            {kouti.skills.slice(0, 5).map((ks) => (
              <div
                key={ks.skill.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#1c1713",
                  border: "1px solid rgba(212, 163, 115, 0.06)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                }}
              >
                <span style={{ fontSize: 14, color: "#9a8575", fontFamily: "monospace" }}>
                  {ks.skill.slug}
                </span>
              </div>
            ))}
            {skillCount > 5 && (
              <span style={{ fontSize: 14, color: "#6b5b4f" }}>
                +{skillCount - 5}
              </span>
            )}
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
