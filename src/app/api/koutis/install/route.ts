import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { apiKey } });
  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const kouti = await prisma.kouti.findUnique({
    where: { slug },
    include: {
      skills: {
        orderBy: { position: "asc" },
        include: {
          skill: {
            include: {
              versions: { orderBy: { version: "desc" }, take: 1 },
              author: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!kouti) {
    return NextResponse.json({ error: "Kouti not found" }, { status: 404 });
  }

  // Increment install counts for all skills
  const skillIds = kouti.skills.map((ks) => ks.skill.id);
  if (skillIds.length > 0) {
    await prisma.skill.updateMany({
      where: { id: { in: skillIds } },
      data: { installCount: { increment: 1 } },
    });
  }

  return NextResponse.json({
    name: kouti.name,
    slug: kouti.slug,
    description: kouti.description,
    skills: kouti.skills.map((ks) => ({
      name: ks.skill.name,
      slug: ks.skill.slug,
      flavor: ks.skill.flavor,
      tags: ks.skill.tags,
      author: ks.skill.author.name,
      version: ks.skill.versions[0]?.version ?? 0,
      content: ks.skill.versions[0]?.content ?? "",
      bundle: ks.skill.versions[0]?.bundle,
    })),
  });
}
