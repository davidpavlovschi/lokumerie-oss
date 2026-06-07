import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/embedding";

interface SemanticSkillRow {
  id: string;
  name: string;
  slug: string;
  flavor: string;
  tags: string[];
  description: string | null;
  installCount: number;
  authorName: string | null;
  similarity: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const queryEmbedding = await embedText(q);
    const vectorStr = `[${queryEmbedding.join(",")}]`;

    const results = await prisma.$queryRawUnsafe<SemanticSkillRow[]>(
      `SELECT
        s."id",
        s."name",
        s."slug",
        s."flavor",
        s."tags",
        s."description",
        s."installCount",
        u."name" AS "authorName",
        1 - (s."embedding" <=> $1::vector) AS "similarity"
      FROM "Skill" s
      LEFT JOIN "User" u ON s."authorId" = u."id"
      WHERE s."embedding" IS NOT NULL
      ORDER BY s."embedding" <=> $1::vector
      LIMIT 20`,
      vectorStr
    );

    return NextResponse.json(
      results.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        flavor: r.flavor,
        tags: r.tags,
        description: r.description,
        installCount: r.installCount,
        author: r.authorName,
        similarity: Math.round(r.similarity * 100) / 100,
      }))
    );
  } catch (e) {
    console.error("Semantic search failed:", e);

    // Fallback to keyword search
    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tags: { has: q.toLowerCase() } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return NextResponse.json(
      skills.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        flavor: s.flavor,
        tags: s.tags,
        description: s.description,
        installCount: s.installCount,
        author: s.author.name,
        similarity: null,
      }))
    );
  }
}
