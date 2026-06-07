import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q || q.length < 2) return NextResponse.json([]);

  const skills = await prisma.skill.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    select: { id: true, name: true, slug: true, flavor: true },
    take: 10,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(skills);
}
