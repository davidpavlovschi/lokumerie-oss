import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
  // 1. Set usernames for existing users
  const users = await prisma.user.findMany({
    where: { username: null },
    include: {
      accounts: { select: { provider: true, providerAccountId: true } },
    },
  });

  for (const user of users) {
    let base: string | undefined;

    if (user.email) {
      base = user.email.split("@")[0];
    } else if (user.name) {
      base = slugify(user.name);
    } else {
      base = "user";
    }

    // Ensure uniqueness
    let username = slugify(base);
    let counter = 2;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${slugify(base)}${counter}`;
      counter++;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });
    console.log(`  Set username for ${user.name || user.email}: ${username}`);
  }

  // 2. Update existing skill slugs to {username}-{slugify(name)}
  const skills = await prisma.skill.findMany({
    include: { author: { select: { username: true, name: true } } },
  });

  for (const skill of skills) {
    const prefix = skill.author.username || slugify(skill.author.name || "user");
    const newSlug = `${prefix}-${slugify(skill.name)}`;

    // Check for collision
    const existing = await prisma.skill.findUnique({ where: { slug: newSlug } });
    if (existing && existing.id !== skill.id) {
      console.log(`  SKIP ${skill.name} — slug collision: ${newSlug}`);
      continue;
    }

    if (skill.slug !== newSlug) {
      await prisma.skill.update({
        where: { id: skill.id },
        data: { slug: newSlug },
      });
      console.log(`  ${skill.slug} → ${newSlug}`);
    }
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
