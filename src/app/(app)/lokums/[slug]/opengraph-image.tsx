import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { FLAVORS, type FlavorKey } from "@/lib/flavors";
import { formatSkillName, cleanDescription } from "@/lib/format-skill";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Lokumerie — Skill Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const lokum = await prisma.skill.findUnique({
    where: { slug },
    select: { name: true, description: true, flavor: true, author: { select: { name: true } } },
  });

  if (!lokum) {
    return new ImageResponse(
      <div style={{ background: "#110e0b", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b5b4f", fontSize: 32 }}>
        Skill not found
      </div>,
      { ...size }
    );
  }

  const title = formatSkillName(lokum.name);
  const description = cleanDescription(lokum.description) || "";
  const flavor = FLAVORS[lokum.flavor as FlavorKey];
  const flavorColor = flavor?.color || "#d4a373";
  const flavorLabel = flavor?.label || lokum.flavor;

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
        {/* Top: flavor badge + author */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: flavorColor + "18",
              border: `1px solid ${flavorColor}30`,
              borderRadius: "999px",
              padding: "6px 16px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                background: flavorColor,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: flavorColor,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {flavorLabel}
            </span>
          </div>
          <span style={{ fontSize: 16, color: "#6b5b4f" }}>
            par {lokum.author.name}
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
            {title}
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

        {/* Bottom: install command + branding */}
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
              lokum install{" "}
            </span>
            <span style={{ fontSize: 16, color: "#d4a373", fontFamily: "monospace" }}>
              {slug}
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
