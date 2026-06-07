import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateLokum } from "@/lib/actions/lokums";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ModifierPage({ params }: Props) {
  const { slug } = await params;

  const lokum = await prisma.skill.findUnique({
    where: { slug },
    include: {
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  if (!lokum || lokum.versions.length === 0) notFound();

  const latestVersion = lokum.versions[0];
  const updateWithId = updateLokum.bind(null, lokum.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/lokums/${slug}`}
        className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="font-display text-3xl text-text-primary">
        {lokum.name}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        v{latestVersion.version} &middot; Collez le nouveau contenu
      </p>

      <form action={updateWithId} className="mt-6 space-y-4">
        <textarea
          name="content"
          defaultValue={latestVersion.content}
          rows={24}
          className="w-full rounded-2xl border border-border bg-bg-elevated p-4 font-mono text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-border-hover resize-y"
        />

        <input
          name="changelog"
          type="text"
          placeholder="Qu'est-ce qui a change ? (optionnel)"
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-border-hover"
        />

        <button
          type="submit"
          className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-bg-base transition-colors hover:bg-accent/90"
        >
          Sortir du four
        </button>
      </form>
    </div>
  );
}
