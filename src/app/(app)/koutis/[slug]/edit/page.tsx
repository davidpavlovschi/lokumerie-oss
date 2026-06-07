import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { EditKoutiForm } from "./EditKoutiForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditKoutiPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const t = await getTranslations("koutis");

  const kouti = await prisma.kouti.findUnique({
    where: { slug },
    include: {
      skills: {
        orderBy: { position: "asc" },
        include: { skill: { select: { id: true, name: true, slug: true, flavor: true } } },
      },
    },
  });

  if (!kouti) notFound();
  if (kouti.authorId !== session?.user?.id) redirect(`/koutis/${slug}`);

  const existingSkills = kouti.skills.map((ks) => ({
    id: ks.skill.id,
    name: ks.skill.name,
    slug: ks.skill.slug,
    flavor: ks.skill.flavor,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          {t("editTitle")}
        </h1>
      </div>
      <EditKoutiForm kouti={kouti} existingSkills={existingSkills} />
    </div>
  );
}
