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

  const since = user.lastSeenNotificationsAt;

  const [newSkills, newSources] = await Promise.all([
    prisma.skill.findMany({
      where: { createdAt: { gt: since } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.source.findMany({
      where: { createdAt: { gt: since } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Update lastSeen
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenNotificationsAt: new Date() },
  });

  return NextResponse.json({
    since: since.toISOString(),
    newSkills: newSkills.length,
    newSources: newSources.length,
    items: [
      ...newSkills.map((s) => ({
        type: "skill",
        name: s.name,
        slug: s.slug,
        author: s.author.name,
        createdAt: s.createdAt.toISOString(),
      })),
      ...newSources.map((s) => ({
        type: "source",
        name: s.title,
        author: s.author.name,
        createdAt: s.createdAt.toISOString(),
      })),
    ],
  });
}
