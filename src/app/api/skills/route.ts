import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify, parseSkillMarkdown } from "@/lib/parse-skill";
import { embedText, buildEmbeddableText } from "@/lib/embedding";
import {
  getSkillMdFromBundle,
  validateCodexSkillBundle,
  type CodexSkillBundle,
} from "@/lib/codex-skill-bundle";

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
  const q = searchParams.get("q");
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  const versions = searchParams.get("versions");
  const versionParam = searchParams.get("version");

  // Get single skill content by id or slug
  if (id || slug) {
    const skill = await prisma.skill.findFirst({
      where: id ? { id } : { slug: slug! },
      include: {
        author: { select: { name: true } },
        versions: { orderBy: { version: "desc" } },
      },
    });
    if (!skill || skill.versions.length === 0) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Return all versions list
    if (versions === "true") {
      return NextResponse.json({
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        versions: skill.versions.map((v) => ({
          version: v.version,
          changelog: v.changelog,
          createdAt: v.createdAt.toISOString(),
          hasBundle: Boolean(v.bundle),
        })),
      });
    }

    // Increment install count
    await prisma.skill.update({
      where: { id: skill.id },
      data: { installCount: { increment: 1 } },
    });

    // Return specific version or latest
    const targetVersion = versionParam
      ? skill.versions.find((v) => v.version === parseInt(versionParam))
      : skill.versions[0];

    if (!targetVersion) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      flavor: skill.flavor,
      tags: skill.tags,
      description: skill.description,
      author: skill.author.name,
      version: targetVersion.version,
      content: targetVersion.content,
      bundle: targetVersion.bundle,
    });
  }

  // List skills
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { tags: { has: q.toLowerCase() } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const skills = await prisma.skill.findMany({
    where,
    include: {
      author: { select: { name: true } },
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    skills.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      flavor: s.flavor,
      tags: s.tags,
      description: s.description,
      author: s.author.name,
      version: s.versions[0]?.version ?? 0,
      hasBundle: Boolean(s.versions[0]?.bundle),
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

  const contentType = request.headers.get("content-type") || "";
  let content: string;
  let changelog: string | undefined;
  let bundle: CodexSkillBundle | null = null;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const parsedBundle = validateCodexSkillBundle(body.bundle);
    if (body.bundle && !parsedBundle) {
      return NextResponse.json({ error: "Invalid Codex skill bundle" }, { status: 400 });
    }
    bundle = parsedBundle;
    content = typeof body.content === "string" ? body.content : "";
    if (bundle && !content) {
      content = getSkillMdFromBundle(bundle) ?? "";
    }
    changelog = typeof body.changelog === "string" ? body.changelog : undefined;
  } else {
    content = await request.text();
  }

  if (!content || content.trim().length < 10) {
    return NextResponse.json({ error: "Content too short" }, { status: 400 });
  }

  content = content.trim();
  const parsed = parseSkillMarkdown(content);
  const usernamePrefix = user.username || slugify(user.name || "user");
  const slug = `${usernamePrefix}-${slugify(parsed.name)}`;

  const existing = await prisma.skill.findFirst({
    where: { authorId: user.id, name: parsed.name },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  if (existing) {
    const nextVersion = (existing.versions[0]?.version ?? 0) + 1;
    await prisma.skillVersion.create({
      data: {
        skillId: existing.id,
        version: nextVersion,
        content,
        bundle: bundle ? (bundle as unknown as Prisma.InputJsonValue) : undefined,
        changelog: changelog || "Pushed via CLI",
      },
    });

    // Generate embedding for updated skill
    const embeddableText = buildEmbeddableText({
      name: parsed.name,
      description: parsed.description,
      tags: parsed.tags,
    });
    let embeddingVector: number[] | null = null;
    try {
      embeddingVector = await embedText(embeddableText);
    } catch (e) {
      console.error("Failed to generate embedding for skill update:", e);
    }

    if (embeddingVector) {
      const vectorStr = `[${embeddingVector.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "Skill" SET "flavor" = $1, "tags" = $2, "description" = $3, "embedding" = $4::vector WHERE "id" = $5`,
        parsed.flavor,
        parsed.tags,
        parsed.description,
        vectorStr,
        existing.id
      );
    } else {
      await prisma.skill.update({
        where: { id: existing.id },
        data: {
          flavor: parsed.flavor,
          tags: parsed.tags,
          description: parsed.description,
        },
      });
    }

    return NextResponse.json({
      status: "updated",
      name: existing.name,
      slug: existing.slug,
      version: nextVersion,
      id: existing.id,
      bundle: Boolean(bundle),
    });
  }

  const skill = await prisma.skill.create({
    data: {
      name: parsed.name,
      slug,
      flavor: parsed.flavor,
      tags: parsed.tags,
      description: parsed.description,
      authorId: user.id,
      versions: {
        create: {
          version: 1,
          content,
          bundle: bundle ? (bundle as unknown as Prisma.InputJsonValue) : undefined,
        },
      },
    },
  });

  // Generate embedding for new skill
  const embeddableText = buildEmbeddableText({
    name: parsed.name,
    description: parsed.description,
    tags: parsed.tags,
  });
  try {
    const embeddingVector = await embedText(embeddableText);
    const vectorStr = `[${embeddingVector.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE "Skill" SET "embedding" = $1::vector WHERE "id" = $2`,
      vectorStr,
      skill.id
    );
  } catch (e) {
    console.error("Failed to generate embedding for new skill:", e);
  }

  return NextResponse.json({
    status: "created",
    name: skill.name,
    slug: skill.slug,
    version: 1,
    id: skill.id,
    bundle: Boolean(bundle),
  });
}
