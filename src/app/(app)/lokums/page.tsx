import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Terminal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LokumCard } from "@/components/lokums/LokumCard";
import { LokumFilters } from "@/components/lokums/LokumFilters";
import { SemanticSearch } from "@/components/lokums/SemanticSearch";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { LokumTable } from "@/components/lokums/LokumTable";

export const metadata: Metadata = {
  title: "Les Lokums — Lokumerie",
  description: "Des skills Claude Code artisanaux, cuits au four et prêts à installer.",
  openGraph: {
    title: "Les Lokums",
    description: "Des skills Claude Code artisanaux, cuits au four et prêts à installer.",
    type: "website",
    siteName: "Lokumerie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Les Lokums",
    description: "Des skills Claude Code artisanaux, cuits au four et prêts à installer.",
  },
};

interface Props {
  searchParams: Promise<{ q?: string; flavor?: string; artisan?: string; sort?: string; view?: string }>;
}

export default async function EtalagePage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("lokums");

  const where = {
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" as const } },
        { tags: { has: params.q.toLowerCase() } },
      ],
    }),
    ...(params.flavor && { flavor: params.flavor }),
    ...(params.artisan && { authorId: params.artisan }),
  };

  const orderBy = params.sort === "popular"
    ? { installCount: "desc" as const }
    : { updatedAt: "desc" as const };

  const [lokums, artisans] = await Promise.all([
    prisma.skill.findMany({
      where,
      include: { author: { select: { name: true, image: true } } },
      orderBy,
      take: 50,
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const view = params.view ?? "grid";

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("count", { count: lokums.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle />
          <Link
            href="/lokums/new"
            className="group flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-4 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/15 hover:border-accent/30"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("bake")}
          </Link>
        </div>
      </div>

      {/* Semantic search */}
      <div className="mt-6">
        <Suspense>
          <SemanticSearch />
        </Suspense>
      </div>

      {/* Filters */}
      <div className="mt-4">
        <Suspense>
          <LokumFilters artisans={artisans} />
        </Suspense>
      </div>

      {lokums.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/[0.06] border border-border">
            <Terminal className="h-7 w-7 text-accent/40" />
          </div>
          <p className="mt-5 font-display text-xl text-text-secondary">
            {t("emptyTitle")}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-text-muted">
            {t("emptyDesc")}
          </p>
          <code className="mt-4 rounded-lg bg-bg-elevated border border-border px-4 py-2 font-mono text-xs text-accent">
            lokum push release-checklist.md
            <br />
            lokum push release-checklist/
          </code>
        </div>
      ) : view === "table" ? (
        <div className="mt-6">
          <LokumTable lokums={lokums} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lokums.map((lokum, i) => (
            <LokumCard key={lokum.id} lokum={lokum} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
