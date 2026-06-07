import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LokumCard } from "@/components/lokums/LokumCard";
import { RelatedContent } from "@/components/ui/RelatedContent";
import {
  ChevronLeft,
  Package,
  Pencil,
  User,
  Clock,
  Download,
} from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { DeleteKoutiButton } from "./DeleteKoutiButton";
import { CopyKoutiInstall } from "./CopyKoutiInstall";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const kouti = await prisma.kouti.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      author: { select: { name: true } },
      _count: { select: { skills: true } },
    },
  });

  if (!kouti) return {};

  const title = kouti.name;
  const description =
    kouti.description ||
    `Collection de ${kouti._count.skills} skill${kouti._count.skills !== 1 ? "s" : ""} par ${kouti.author.name}`;

  return {
    title: `${title} — Lokumerie`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Lokumerie",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function KoutiDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("koutis");
  const locale = await getLocale();
  const session = await auth();

  const kouti = await prisma.kouti.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true } },
      skills: {
        orderBy: { position: "asc" },
        include: {
          skill: {
            include: {
              author: { select: { name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!kouti) notFound();

  const isOwner = session?.user?.id === kouti.author.id;

  return (
    <div className="space-y-8">
      <Link
        href="/koutis"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("breadcrumb")}
      </Link>

      {/* Hero */}
      <div className="rounded-2xl border border-border bg-bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/[0.08]">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-2xl tracking-tight text-text-primary sm:text-3xl">
                  {kouti.name}
                </h1>
                <p className="mt-0.5 text-sm text-text-muted">
                  {t("by", { name: kouti.author.name ?? "" })}
                </p>
              </div>
            </div>
            {kouti.description && (
              <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">
                {kouti.description}
              </p>
            )}
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/koutis/${slug}/edit`}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-border-hover hover:text-text-primary hover:bg-bg-hover"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("edit")}
              </Link>
              <DeleteKoutiButton koutiId={kouti.id} />
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-6 flex items-center gap-6 text-sm text-text-muted">
          <span className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            {kouti.skills.length} skill{kouti.skills.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            {kouti.author.image ? (
              <img src={kouti.author.image} alt="" className="h-4 w-4 rounded-full" />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            {kouti.author.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date(kouti.updatedAt).toLocaleDateString(
              locale === "en" ? "en-US" : "fr-FR",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          </span>
        </div>

        {/* Bulk install command */}
        {kouti.skills.length > 0 && (
          <div className="mt-6 rounded-xl bg-bg-base border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-accent/60" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {t("installAll")}
                </span>
              </div>
              <CopyKoutiInstall slugs={kouti.skills.map((ks) => ks.skill.slug)} />
            </div>
            <pre className="font-mono text-xs text-text-secondary select-all whitespace-pre-wrap leading-relaxed">
              {kouti.skills.map((ks) => `lokum install ${ks.skill.slug}`).join("\n")}
            </pre>
          </div>
        )}
      </div>

      {/* Skills grid + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          {kouti.skills.length === 0 ? (
            <div className="rounded-2xl border border-border bg-bg-surface p-8 text-center">
              <p className="text-sm text-text-muted">{t("emptySkills")}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {kouti.skills.map((ks, i) => (
                <LokumCard key={ks.skill.id} lokum={ks.skill} index={i} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <RelatedContent type="kouti" id={kouti.id} />
        </div>
      </div>
    </div>
  );
}
