import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/parse-skill";

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

  if (slug) {
    const kouti = await prisma.kouti.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
        skills: {
          orderBy: { position: "asc" },
          include: { skill: { select: { name: true, slug: true, flavor: true } } },
        },
      },
    });
    if (!kouti) {
      return NextResponse.json({ error: "Kouti not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: kouti.id,
      name: kouti.name,
      slug: kouti.slug,
      description: kouti.description,
      author: kouti.author.name,
      skills: kouti.skills.map((ks) => ({
        name: ks.skill.name,
        slug: ks.skill.slug,
        flavor: ks.skill.flavor,
      })),
    });
  }

  const koutis = await prisma.kouti.findMany({
    where: { authorId: user.id },
    include: {
      _count: { select: { skills: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    koutis.map((k) => ({
      id: k.id,
      name: k.name,
      slug: k.slug,
      description: k.description,
      visibility: k.visibility,
      skillCount: k._count.skills,
    }))
  );
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { apiKey } });
  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, visibility, skillSlugs } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const usernamePrefix = user.username || slugify(user.name || "user");
  const slug = `${usernamePrefix}-${slugify(name)}`;

  // Resolve skill slugs to IDs
  let skillIds: string[] = [];
  if (skillSlugs?.length) {
    const skills = await prisma.skill.findMany({
      where: { slug: { in: skillSlugs } },
      select: { id: true },
    });
    skillIds = skills.map((s) => s.id);
  }

  const existing = await prisma.kouti.findUnique({ where: { slug } });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.kouti.update({
        where: { id: existing.id },
        data: {
          ...(description !== undefined && { description }),
          ...(visibility && { visibility }),
        },
      });
      if (skillIds.length > 0) {
        await tx.koutiSkill.deleteMany({ where: { koutiId: existing.id } });
        await tx.koutiSkill.createMany({
          data: skillIds.map((skillId, i) => ({
            koutiId: existing.id,
            skillId,
            position: i,
          })),
        });
      }
    });

    return NextResponse.json({ status: "updated", slug: existing.slug });
  }

  const kouti = await prisma.kouti.create({
    data: {
      name,
      slug,
      description: description || null,
      visibility: visibility || "public",
      authorId: user.id,
      skills: {
        create: skillIds.map((skillId, i) => ({
          skillId,
          position: i,
        })),
      },
    },
  });

  return NextResponse.json({ status: "created", slug: kouti.slug });
}

export async function DELETE(request: NextRequest) {
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

  const kouti = await prisma.kouti.findUnique({ where: { slug } });
  if (!kouti) {
    return NextResponse.json({ error: "Kouti not found" }, { status: 404 });
  }
  if (kouti.authorId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.kouti.delete({ where: { id: kouti.id } });
  return NextResponse.json({ status: "deleted" });
}
