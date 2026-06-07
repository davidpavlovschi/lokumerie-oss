import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { detectFlavor } from "../src/lib/flavors";
import { parseFrontmatter } from "../src/lib/parse-skill";

const prisma = new PrismaClient();

async function main() {
  const skills = await prisma.skill.findMany({
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  let updated = 0;
  let skipped = 0;

  for (const skill of skills) {
    const content = skill.versions[0]?.content;
    if (!content) {
      console.log(`SKIP ${skill.name} — no version content`);
      skipped++;
      continue;
    }

    const { frontmatter } = parseFrontmatter(content);
    if (frontmatter.flavor) {
      console.log(`SKIP ${skill.name} — explicit flavor: ${frontmatter.flavor}`);
      skipped++;
      continue;
    }

    const newFlavor = detectFlavor(content);
    if (newFlavor !== skill.flavor) {
      await prisma.skill.update({
        where: { id: skill.id },
        data: { flavor: newFlavor },
      });
      console.log(`UPDATE ${skill.name}: ${skill.flavor} -> ${newFlavor}`);
      updated++;
    } else {
      console.log(`OK ${skill.name}: ${skill.flavor} (unchanged)`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Total: ${skills.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
