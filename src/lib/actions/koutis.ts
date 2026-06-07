"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { auth } from "../auth";
import { slugify } from "../parse-skill";

export async function createKouti(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Nom requis");

  const description = (formData.get("description") as string)?.trim() || null;
  const visibility = (formData.get("visibility") as string) || "public";
  const skillIdsRaw = formData.get("skillIds") as string | null;
  const skillIds = skillIdsRaw ? skillIdsRaw.split(",").filter(Boolean) : [];

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true },
  });
  const usernamePrefix = user?.username || slugify(user?.name || "user");
  const slug = `${usernamePrefix}-${slugify(name)}`;

  const kouti = await prisma.kouti.create({
    data: {
      name,
      slug,
      description,
      visibility,
      authorId: session.user.id,
      skills: {
        create: skillIds.map((skillId, i) => ({
          skillId,
          position: i,
        })),
      },
    },
  });

  revalidatePath("/koutis");
  redirect(`/koutis/${kouti.slug}`);
}

export async function updateKouti(koutiId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const kouti = await prisma.kouti.findUnique({
    where: { id: koutiId },
    select: { authorId: true, slug: true },
  });
  if (!kouti || kouti.authorId !== session.user.id) throw new Error("Non autorise");

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const visibility = (formData.get("visibility") as string) || undefined;
  const skillIdsRaw = formData.get("skillIds") as string | null;
  const skillIds = skillIdsRaw ? skillIdsRaw.split(",").filter(Boolean) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.kouti.update({
      where: { id: koutiId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(visibility && { visibility }),
      },
    });

    if (skillIds) {
      await tx.koutiSkill.deleteMany({ where: { koutiId } });
      if (skillIds.length > 0) {
        await tx.koutiSkill.createMany({
          data: skillIds.map((skillId, i) => ({
            koutiId,
            skillId,
            position: i,
          })),
        });
      }
    }
  });

  revalidatePath(`/koutis/${kouti.slug}`);
  revalidatePath("/koutis");
  redirect(`/koutis/${kouti.slug}`);
}

export async function deleteKouti(koutiId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const kouti = await prisma.kouti.findUnique({
    where: { id: koutiId },
    select: { authorId: true },
  });
  if (!kouti || kouti.authorId !== session.user.id) throw new Error("Non autorise");

  await prisma.kouti.delete({ where: { id: koutiId } });

  revalidatePath("/koutis");
  redirect("/koutis");
}

export async function reorderKoutiSkills(koutiId: string, orderedSkillIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const kouti = await prisma.kouti.findUnique({
    where: { id: koutiId },
    select: { authorId: true },
  });
  if (!kouti || kouti.authorId !== session.user.id) throw new Error("Non autorise");

  await prisma.$transaction(
    orderedSkillIds.map((skillId, i) =>
      prisma.koutiSkill.updateMany({
        where: { koutiId, skillId },
        data: { position: i },
      })
    )
  );

  revalidatePath("/koutis");
}

export async function addSkillToKouti(koutiId: string, skillId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorise");

  const kouti = await prisma.kouti.findUnique({
    where: { id: koutiId },
    select: { authorId: true, slug: true },
  });
  if (!kouti || kouti.authorId !== session.user.id) throw new Error("Non autorise");

  const maxPos = await prisma.koutiSkill.aggregate({
    where: { koutiId },
    _max: { position: true },
  });

  await prisma.koutiSkill.create({
    data: {
      koutiId,
      skillId,
      position: (maxPos._max.position ?? -1) + 1,
    },
  });

  revalidatePath(`/koutis/${kouti.slug}`);
}
