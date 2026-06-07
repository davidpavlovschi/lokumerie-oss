import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SourceCard } from "@/components/sources/SourceCard";
import { QuickAddBar } from "@/components/sources/QuickAddBar";
import { SourceTabs } from "@/components/sources/SourceTabs";
import { TagFilter } from "@/components/sources/TagFilter";
import { getTranslations } from "next-intl/server";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { SourceTable } from "@/components/sources/SourceTable";

export const metadata: Metadata = {
  title: "Le Garde-Manger — Lokumerie",
  description: "Vidéos, repos, articles et fils Twitter — les ingrédients de nos skills.",
  openGraph: {
    title: "Le Garde-Manger",
    description: "Vidéos, repos, articles et fils Twitter — les ingrédients de nos skills.",
    type: "website",
    siteName: "Lokumerie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Le Garde-Manger",
    description: "Vidéos, repos, articles et fils Twitter — les ingrédients de nos skills.",
  },
};

interface Props {
  searchParams: Promise<{ type?: string; q?: string; tag?: string; view?: string }>;
}

export default async function GardeMangerPage({ searchParams }: Props) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const params = await searchParams;
  const t = await getTranslations("sources");

  const where = {
    ...(params.type && { sourceType: params.type }),
    ...(params.tag && { tags: { has: params.tag } }),
    ...(params.q && {
      OR: [
        { title: { contains: params.q, mode: "insensitive" as const } },
        { tags: { has: params.q.toLowerCase() } },
        { content: { contains: params.q, mode: "insensitive" as const } },
      ],
    }),
  };

  const sources = await prisma.source.findMany({
    where,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const counts = {
    all: await prisma.source.count(),
    youtube: await prisma.source.count({ where: { sourceType: "youtube" } }),
    github: await prisma.source.count({ where: { sourceType: "github" } }),
    twitter: await prisma.source.count({ where: { sourceType: "twitter" } }),
    billet: await prisma.source.count({ where: { sourceType: "billet" } }),
    other: await prisma.source.count({ where: { sourceType: "other" } }),
  };

  // Aggregate tags with counts
  const allSources = await prisma.source.findMany({ select: { tags: true } });
  const tagCounts = new Map<string, number>();
  for (const s of allSources) {
    for (const t of s.tags) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }
  const tagList = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const view = params.view ?? "grid";

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("subtitle")}
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Quick add */}
      <div className="mt-6">
        <QuickAddBar />
      </div>

      {/* Type tabs */}
      <div className="mt-6">
        <SourceTabs counts={counts} activeType={params.type} />
      </div>

      {/* Tag filter */}
      {tagList.length > 0 && (
        <div className="mt-4">
          <TagFilter tags={tagList} activeTag={params.tag} />
        </div>
      )}

      {sources.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/[0.06] border border-border">
            <svg className="h-7 w-7 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </div>
          <p className="mt-5 font-display text-xl text-text-secondary">
            {t("emptyTitle")}
          </p>
          <p className="mt-1.5 text-sm text-text-muted">
            {t("emptyDesc")}
          </p>
        </div>
      ) : view === "table" ? (
        <div className="mt-5">
          <SourceTable sources={sources} currentUserId={currentUserId} />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source, i) => (
            <SourceCard key={source.id} source={source} index={i} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
