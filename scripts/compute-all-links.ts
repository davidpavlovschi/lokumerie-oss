import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function upsertLinks(links: LinkCandidate[]) {
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

async function main() {
  console.log("Computing all content links...");

  // Clear non-manual links
  const deleted = await prisma.contentLink.deleteMany({
    where: { linkType: { not: "manual" } },
  });
  console.log(`Cleared ${deleted.count} existing auto-links`);

  const skills = await prisma.skill.findMany({
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });
  const sources = await prisma.source.findMany();
  const koutis = await prisma.kouti.findMany({
    include: { skills: { select: { skillId: true } } },
  });

  console.log(`Processing ${skills.length} skills, ${sources.length} sources, ${koutis.length} koutis`);

  // Skill-to-skill links
  for (const skill of skills) {
    const links: LinkCandidate[] = [];

    // Tag overlap
    if (skill.tags.length > 0) {
      for (const other of skills) {
        if (other.id === skill.id) continue;
        const shared = skill.tags.filter((t) => other.tags.includes(t)).length;
        if (shared > 0) {
          const n = normalize(skill.id, "skill", other.id, "skill");
          links.push({ ...n, linkType: "tag", weight: shared * 1.0 });
        }
      }
      for (const source of sources) {
        const shared = skill.tags.filter((t) => source.tags.includes(t)).length;
        if (shared > 0) {
          const n = normalize(skill.id, "skill", source.id, "source");
          links.push({ ...n, linkType: "tag", weight: shared * 1.0 });
        }
      }
    }

    // Same flavor
    for (const other of skills) {
      if (other.id === skill.id) continue;
      if (other.flavor === skill.flavor) {
        const n = normalize(skill.id, "skill", other.id, "skill");
        links.push({ ...n, linkType: "flavor", weight: 0.5 });
      }
    }

    // Mentions
    const content = skill.versions[0]?.content?.toLowerCase();
    if (content) {
      for (const other of skills) {
        if (other.id === skill.id) continue;
        if (content.includes(other.name.toLowerCase()) || content.includes(other.slug)) {
          const n = normalize(skill.id, "skill", other.id, "skill");
          links.push({ ...n, linkType: "mention", weight: 2.0 });
        }
      }
      for (const source of sources) {
        if (content.includes(source.title.toLowerCase())) {
          const n = normalize(skill.id, "skill", source.id, "source");
          links.push({ ...n, linkType: "mention", weight: 2.0 });
        }
      }
    }

    await upsertLinks(links);
    console.log(`  Skill "${skill.name}": ${links.length} links`);
  }

  // Source-to-source + source-to-skill tag links
  for (const source of sources) {
    const links: LinkCandidate[] = [];

    if (source.tags.length > 0) {
      for (const other of sources) {
        if (other.id === source.id) continue;
        const shared = source.tags.filter((t) => other.tags.includes(t)).length;
        if (shared > 0) {
          const n = normalize(source.id, "source", other.id, "source");
          links.push({ ...n, linkType: "tag", weight: shared * 1.0 });
        }
      }
    }

    // Source content mentions
    if (source.content) {
      const contentLower = source.content.toLowerCase();
      for (const skill of skills) {
        if (contentLower.includes(skill.name.toLowerCase()) || contentLower.includes(skill.slug)) {
          const n = normalize(source.id, "source", skill.id, "skill");
          links.push({ ...n, linkType: "mention", weight: 2.0 });
        }
      }
    }

    await upsertLinks(links);
    if (links.length > 0) console.log(`  Source "${source.title}": ${links.length} links`);
  }

  // Kouti co-occurrence links
  for (const kouti of koutis) {
    const ids = kouti.skills.map((s) => s.skillId);
    if (ids.length < 2) continue;

    const links: LinkCandidate[] = [];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const n = normalize(ids[i], "skill", ids[j], "skill");
        links.push({ ...n, linkType: "cooccurrence", weight: 1.5 });
      }
    }
    await upsertLinks(links);
    console.log(`  Kouti "${kouti.name}": ${links.length} co-occurrence links`);
  }

  const total = await prisma.contentLink.count();
  console.log(`\nDone! Total links: ${total}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
