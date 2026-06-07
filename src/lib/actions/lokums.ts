"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { slugify, parseSkillMarkdown } from "../parse-skill";
import { isValidFlavor } from "../flavors";
import { computeLinksForSkill } from "./links";

export async function enfourner(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const content = (formData.get("content") as string)?.trim();
  if (!content || content.length < 10) throw new Error("Contenu trop court");

  const parsed = parseSkillMarkdown(content);

  const nameOverride = (formData.get("name") as string)?.trim();
  const flavorOverride = (formData.get("flavor") as string)?.trim();

  const name = nameOverride || parsed.name;
  const flavor = flavorOverride && isValidFlavor(flavorOverride) ? flavorOverride : parsed.flavor;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true, name: true } });
  const usernamePrefix = user?.username || slugify(user?.name || "user");
  const slug = `${usernamePrefix}-${slugify(name)}`;

  const skill = await prisma.skill.create({
    data: {
      name,
      slug,
      flavor,
      tags: parsed.tags,
      description: parsed.description,
      authorId: session.user.id,
      versions: {
        create: {
          version: 1,
          content,
        },
      },
    },
  });

  computeLinksForSkill(skill.id).catch(() => {});
  revalidatePath("/lokums");
  redirect(`/lokums/${skill.slug}`);
}

export async function updateLokum(skillId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const content = (formData.get("content") as string)?.trim();
  if (!content || content.length < 10) throw new Error("Contenu trop court");

  const changelog = (formData.get("changelog") as string)?.trim() || "Mise a jour";
  const nameOverride = (formData.get("name") as string)?.trim();
  const flavorOverride = (formData.get("flavor") as string)?.trim();

  const parsed = parseSkillMarkdown(content);

  const latestVersion = await prisma.skillVersion.findFirst({
    where: { skillId },
    orderBy: { version: "desc" },
  });

  const nextVersion = (latestVersion?.version ?? 0) + 1;

  await prisma.$transaction([
    prisma.skill.update({
      where: { id: skillId },
      data: {
        ...(nameOverride && { name: nameOverride }),
        ...(flavorOverride && isValidFlavor(flavorOverride) && { flavor: flavorOverride }),
        ...(!flavorOverride && { flavor: parsed.flavor }),
        tags: parsed.tags,
        description: parsed.description,
      },
    }),
    prisma.skillVersion.create({
      data: {
        skillId,
        version: nextVersion,
        content,
        changelog,
      },
    }),
  ]);

  const updatedSkill = await prisma.skill.findUnique({ where: { id: skillId }, select: { slug: true } });
  computeLinksForSkill(skillId).catch(() => {});
  revalidatePath(`/lokums/${updatedSkill?.slug}`);
  revalidatePath("/lokums");
  redirect(`/lokums/${updatedSkill?.slug}`);
}

export async function deleteLokum(skillId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  await prisma.skill.delete({ where: { id: skillId } });

  revalidatePath("/lokums");
  redirect("/lokums");
}
