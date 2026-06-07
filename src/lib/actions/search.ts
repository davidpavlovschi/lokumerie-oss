"use server";

import { prisma } from "../prisma";
import { auth } from "../auth";

export async function unifiedSearch(query: string) {
  const session = await auth();
  if (!session?.user?.id) return { skills: [], sources: [], koutis: [] };
  if (!query || query.length < 2) return { skills: [], sources: [], koutis: [] };

  const [skills, sources, koutis] = await Promise.all([
    prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        flavor: true,
        author: { select: { name: true } },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.source.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        sourceType: true,
        url: true,
        author: { select: { name: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.kouti.findMany({
      where: {
        visibility: "public",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        author: { select: { name: true } },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { skills, sources, koutis };
}
