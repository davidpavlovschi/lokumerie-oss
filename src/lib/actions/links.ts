"use server";

import { prisma } from "../prisma";

type ContentType = "skill" | "source" | "kouti";

interface LinkCandidate {
  sourceType: ContentType;
  sourceId: string;
  targetType: ContentType;
  targetId: string;
  linkType: string;
  weight: number;
}

function normalize(a: string, aType: ContentType, b: string, bType: ContentType) {
  if (aType < bType || (aType === bType && a < b)) {
    return { sourceType: aType, sourceId: a, targetType: bType, targetId: b };
  }
  return { sourceType: bType, sourceId: b, targetType: aType, targetId: a };
}

export async function computeLinksForSkill(skillId: string) {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    select: { id: true, name: true, slug: true, tags: true, flavor: true },
  });
  if (!skill) return;

  // Remove old auto links for this skill
  await prisma.contentLink.deleteMany({
    where: {
      linkType: { not: "manual" },
      OR: [
        { sourceType: "skill", sourceId: skillId },
        { targetType: "skill", targetId: skillId },
      ],
    },
  });

  const links: LinkCandidate[] = [];

  // 1. Tag overlap with other skills
  if (skill.tags.length > 0) {
    const tagMatches = await prisma.skill.findMany({
      where: {
        id: { not: skillId },
        tags: { hasSome: skill.tags },
      },
      select: { id: true, tags: true },
    });
    for (const other of tagMatches) {
      const shared = skill.tags.filter((t) => other.tags.includes(t)).length;
      const { sourceType, sourceId, targetType, targetId } = normalize(skillId, "skill", other.id, "skill");
      links.push({ sourceType, sourceId, targetType, targetId, linkType: "tag", weight: shared * 1.0 });
    }

    // Tag overlap with sources
    const sourceTagMatches = await prisma.source.findMany({
      where: { tags: { hasSome: skill.tags } },
      select: { id: true, tags: true },
    });
    for (const other of sourceTagMatches) {
      const shared = skill.tags.filter((t) => other.tags.includes(t)).length;
      const { sourceType, sourceId, targetType, targetId } = normalize(skillId, "skill", other.id, "source");
      links.push({ sourceType, sourceId, targetType, targetId, linkType: "tag", weight: shared * 1.0 });
    }
  }

  // 2. Same flavor
  const flavorMatches = await prisma.skill.findMany({
    where: { id: { not: skillId }, flavor: skill.flavor },
    select: { id: true },
  });
  for (const other of flavorMatches) {
    const { sourceType, sourceId, targetType, targetId } = normalize(skillId, "skill", other.id, "skill");
    links.push({ sourceType, sourceId, targetType, targetId, linkType: "flavor", weight: 0.5 });
  }

  // 3. Mention detection — check if other skills' names appear in this skill's content
  const latestVersion = await prisma.skillVersion.findFirst({
    where: { skillId },
    orderBy: { version: "desc" },
    select: { content: true },
  });
  if (latestVersion?.content) {
    const contentLower = latestVersion.content.toLowerCase();

    const allSkills = await prisma.skill.findMany({
      where: { id: { not: skillId } },
      select: { id: true, name: true, slug: true },
    });
    for (const other of allSkills) {
      if (contentLower.includes(other.name.toLowerCase()) || contentLower.includes(other.slug)) {
        const { sourceType, sourceId, targetType, targetId } = normalize(skillId, "skill", other.id, "skill");
        links.push({ sourceType, sourceId, targetType, targetId, linkType: "mention", weight: 2.0 });
      }
    }

    const allSources = await prisma.source.findMany({
      select: { id: true, title: true },
    });
    for (const other of allSources) {
      if (contentLower.includes(other.title.toLowerCase())) {
        const { sourceType, sourceId, targetType, targetId } = normalize(skillId, "skill", other.id, "source");
        links.push({ sourceType, sourceId, targetType, targetId, linkType: "mention", weight: 2.0 });
      }
    }
  }

  // Upsert all links
  for (const link of links) {
    await prisma.contentLink.upsert({
      where: {
        sourceType_sourceId_targetType_targetId_linkType: {
          sourceType: link.sourceType,
          sourceId: link.sourceId,
          targetType: link.targetType,
          targetId: link.targetId,
          linkType: link.linkType,
        },
      },
      update: { weight: link.weight },
      create: link,
    });
  }
}

export async function computeLinksForSource(sourceId: string) {
  const source = await prisma.source.findUnique({
    where: { id: sourceId },
    select: { id: true, title: true, tags: true, content: true },
  });
  if (!source) return;

  await prisma.contentLink.deleteMany({
    where: {
      linkType: { not: "manual" },
      OR: [
        { sourceType: "source", sourceId },
        { targetType: "source", targetId: sourceId },
      ],
    },
  });

  const links: LinkCandidate[] = [];

  // Tag overlap with skills
  if (source.tags.length > 0) {
    const tagMatches = await prisma.skill.findMany({
      where: { tags: { hasSome: source.tags } },
      select: { id: true, tags: true },
    });
    for (const other of tagMatches) {
      const shared = source.tags.filter((t) => other.tags.includes(t)).length;
      const { sourceType: st, sourceId: si, targetType: tt, targetId: ti } = normalize(sourceId, "source", other.id, "skill");
      links.push({ sourceType: st, sourceId: si, targetType: tt, targetId: ti, linkType: "tag", weight: shared * 1.0 });
    }

    // Tag overlap with other sources
    const sourceTagMatches = await prisma.source.findMany({
      where: { id: { not: sourceId }, tags: { hasSome: source.tags } },
      select: { id: true, tags: true },
    });
    for (const other of sourceTagMatches) {
      const shared = source.tags.filter((t) => other.tags.includes(t)).length;
      const { sourceType: st, sourceId: si, targetType: tt, targetId: ti } = normalize(sourceId, "source", other.id, "source");
      links.push({ sourceType: st, sourceId: si, targetType: tt, targetId: ti, linkType: "tag", weight: shared * 1.0 });
    }
  }

  // Mention detection
  if (source.content) {
    const contentLower = source.content.toLowerCase();
    const allSkills = await prisma.skill.findMany({
      select: { id: true, name: true, slug: true },
    });
    for (const other of allSkills) {
      if (contentLower.includes(other.name.toLowerCase()) || contentLower.includes(other.slug)) {
        const { sourceType: st, sourceId: si, targetType: tt, targetId: ti } = normalize(sourceId, "source", other.id, "skill");
        links.push({ sourceType: st, sourceId: si, targetType: tt, targetId: ti, linkType: "mention", weight: 2.0 });
      }
    }
  }

  for (const link of links) {
    await prisma.contentLink.upsert({
      where: {
        sourceType_sourceId_targetType_targetId_linkType: {
          sourceType: link.sourceType,
          sourceId: link.sourceId,
          targetType: link.targetType,
          targetId: link.targetId,
          linkType: link.linkType,
        },
      },
      update: { weight: link.weight },
      create: link,
    });
  }
}

export async function computeLinksForKouti(koutiId: string) {
  const kouti = await prisma.kouti.findUnique({
    where: { id: koutiId },
    include: { skills: { select: { skillId: true } } },
  });
  if (!kouti) return;

  // Remove old cooccurrence links for this kouti's skills
  const skillIds = kouti.skills.map((s) => s.skillId);
  if (skillIds.length < 2) return;

  await prisma.contentLink.deleteMany({
    where: {
      linkType: "cooccurrence",
      sourceType: "skill",
      targetType: "skill",
      sourceId: { in: skillIds },
      targetId: { in: skillIds },
    },
  });

  const links: LinkCandidate[] = [];
  for (let i = 0; i < skillIds.length; i++) {
    for (let j = i + 1; j < skillIds.length; j++) {
      const { sourceType, sourceId, targetType, targetId } = normalize(skillIds[i], "skill", skillIds[j], "skill");
      links.push({ sourceType, sourceId, targetType, targetId, linkType: "cooccurrence", weight: 1.5 });
    }
  }

  for (const link of links) {
    await prisma.contentLink.upsert({
      where: {
        sourceType_sourceId_targetType_targetId_linkType: {
          sourceType: link.sourceType,
          sourceId: link.sourceId,
          targetType: link.targetType,
          targetId: link.targetId,
          linkType: link.linkType,
        },
      },
      update: { weight: link.weight },
      create: link,
    });
  }
}

export async function computeAllLinks() {
  const skills = await prisma.skill.findMany({ select: { id: true } });
  for (const skill of skills) {
    await computeLinksForSkill(skill.id);
  }

  const sources = await prisma.source.findMany({ select: { id: true } });
  for (const source of sources) {
    await computeLinksForSource(source.id);
  }

  const koutis = await prisma.kouti.findMany({ select: { id: true } });
  for (const kouti of koutis) {
    await computeLinksForKouti(kouti.id);
  }
}

interface RelatedItem {
  type: ContentType;
  id: string;
  name: string;
  slug: string;
  linkTypes: string[];
  score: number;
}

export async function getRelatedContent(type: ContentType, id: string, limit = 6): Promise<RelatedItem[]> {
  const links = await prisma.contentLink.findMany({
    where: {
      OR: [
        { sourceType: type, sourceId: id },
        { targetType: type, targetId: id },
      ],
    },
  });

  // Aggregate scores by target
  const scoreMap = new Map<string, { type: ContentType; id: string; score: number; linkTypes: Set<string> }>();

  for (const link of links) {
    const isSource = link.sourceType === type && link.sourceId === id;
    const otherType = (isSource ? link.targetType : link.sourceType) as ContentType;
    const otherId = isSource ? link.targetId : link.sourceId;
    const key = `${otherType}:${otherId}`;

    const existing = scoreMap.get(key);
    if (existing) {
      existing.score += link.weight;
      existing.linkTypes.add(link.linkType);
    } else {
      scoreMap.set(key, { type: otherType, id: otherId, score: link.weight, linkTypes: new Set([link.linkType]) });
    }
  }

  const sorted = [...scoreMap.values()].sort((a, b) => b.score - a.score).slice(0, limit);

  // Hydrate names
  const results: RelatedItem[] = [];
  for (const item of sorted) {
    let name = "";
    let slug = "";

    if (item.type === "skill") {
      const skill = await prisma.skill.findUnique({ where: { id: item.id }, select: { name: true, slug: true } });
      if (!skill) continue;
      name = skill.name;
      slug = skill.slug;
    } else if (item.type === "source") {
      const source = await prisma.source.findUnique({ where: { id: item.id }, select: { title: true, id: true } });
      if (!source) continue;
      name = source.title;
      slug = source.id;
    } else if (item.type === "kouti") {
      const kouti = await prisma.kouti.findUnique({ where: { id: item.id }, select: { name: true, slug: true } });
      if (!kouti) continue;
      name = kouti.name;
      slug = kouti.slug;
    }

    results.push({
      type: item.type,
      id: item.id,
      name,
      slug,
      linkTypes: [...item.linkTypes],
      score: item.score,
    });
  }

  return results;
}
