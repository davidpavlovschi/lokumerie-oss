import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KoutiCard } from "@/components/koutis/KoutiCard";
import { KoutiTable } from "@/components/koutis/KoutiTable";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Les Koutis — Lokumerie",
  description: "Collections de skills empaquetées, prêtes à tout installer d'un coup.",
  openGraph: {
    title: "Les Koutis",
    description: "Collections de skills empaquetées, prêtes à tout installer d'un coup.",
    type: "website",
    siteName: "Lokumerie",
  },
  twitter: {
    card: "summary_large_image",
    title: "Les Koutis",
    description: "Collections de skills empaquetées, prêtes à tout installer d'un coup.",
  },
};

interface Props {
  searchParams: Promise<{ q?: string; view?: string }>;
}

export default async function KoutisPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("koutis");

  const where = params.q
    ? {
        OR: [
          { name: { contains: params.q, mode: "insensitive" as const } },
          { description: { contains: params.q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const koutis = await prisma.kouti.findMany({
    where: { ...where, visibility: "public" },
    include: {
      author: { select: { name: true, image: true } },
      skills: {
        orderBy: { position: "asc" },
        take: 3,
        include: { skill: { select: { name: true, flavor: true } } },
      },
      _count: { select: { skills: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const view = params.view ?? "grid";

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {t("count", { count: koutis.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle />
          <Link
            href="/koutis/new"
            className="group flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-4 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/15 hover:border-accent/30"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("create")}
          </Link>
        </div>
      </div>

      {koutis.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/[0.06] border border-border">
            <Package className="h-7 w-7 text-accent/40" />
          </div>
          <p className="mt-5 font-display text-xl text-text-secondary">
            {t("emptyTitle")}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-text-muted">
            {t("emptyDesc")}
          </p>
        </div>
      ) : view === "table" ? (
        <div className="mt-6">
          <KoutiTable koutis={koutis} />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {koutis.map((kouti, i) => (
            <KoutiCard key={kouti.id} kouti={kouti} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
