import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LokumPreview } from "@/components/lokums/LokumPreview";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import { CopyButton } from "./CopyButton";
import { DeleteButton } from "./DeleteButton";
import {
  Pencil,
  History,
  Clock,
  Terminal,
  User,
  Tag,
  ChevronLeft,
  Layers,
  Download,
  Package,
} from "lucide-react";
import { RelatedContent } from "@/components/ui/RelatedContent";
import { BacklinksList } from "@/components/ui/BacklinksList";
import { formatSkillName, cleanDescription } from "@/lib/format-skill";
import { getTranslations, getLocale } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const lokum = await prisma.skill.findUnique({
    where: { slug },
    select: { name: true, description: true, flavor: true, author: { select: { name: true } } },
  });

  if (!lokum) return {};

  const title = formatSkillName(lokum.name);
  const description = cleanDescription(lokum.description) || `Claude Code skill by ${lokum.author.name}`;

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

function looksLikeCuid(s: string): boolean {
  return /^c[a-z0-9]{24}$/.test(s);
}

export default async function LokumDetailPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("lokums");
  const locale = await getLocale();

  // Backward compat: if it looks like a cuid, look up by id and redirect
  if (looksLikeCuid(slug)) {
    const byId = await prisma.skill.findUnique({ where: { id: slug }, select: { slug: true } });
    if (byId) redirect(`/lokums/${byId.slug}`);
    notFound();
  }

  const lokum = await prisma.skill.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, image: true } },
      versions: { orderBy: { version: "desc" }, take: 1 },
    },
  });

  if (!lokum || lokum.versions.length === 0) notFound();

  const latestVersion = lokum.versions[0];

  // Koutis containing this skill
  const containingKoutis = await prisma.koutiSkill.findMany({
    where: { skillId: lokum.id },
    include: { kouti: { select: { name: true, slug: true } } },
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link
        href="/lokums"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-secondary"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("breadcrumb")}
      </Link>

      {/* Hero header */}
      <div className="rounded-2xl border border-border bg-bg-surface p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/[0.08]">
                <Terminal className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl tracking-tight text-text-primary sm:text-3xl">
                    {formatSkillName(lokum.name)}
                  </h1>
                  <FlavorBadge flavor={lokum.flavor} size="md" />
                </div>
                <p className="mt-0.5 text-sm text-text-muted">
                  {t("by", { name: lokum.author.name ?? "" })}
                </p>
              </div>
            </div>
            {lokum.description && (
              <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">
                {cleanDescription(lokum.description)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <CopyButton content={latestVersion.content} />
            <Link
              href={`/lokums/${slug}/edit`}
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-border-hover hover:text-text-primary hover:bg-bg-hover"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("edit")}
            </Link>
            <Link
              href={`/lokums/${slug}/fournees`}
              className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-secondary transition-all hover:border-border-hover hover:text-text-primary hover:bg-bg-hover"
            >
              <History className="h-3.5 w-3.5" />
              {t("batches")}
            </Link>
            <DeleteButton skillId={lokum.id} />
          </div>
        </div>

        {/* Install command */}
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-bg-base border border-border px-5 py-3">
          <Terminal className="h-4 w-4 shrink-0 text-accent/60" />
          <code className="font-mono text-sm text-text-secondary">
            lokum install{" "}
            <span className="text-accent">{lokum.slug}</span>
          </code>
          {lokum.installCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs text-text-muted">
              <Download className="h-3 w-3" />
              {lokum.installCount}
            </span>
          )}
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Markdown content */}
        <LokumPreview content={latestVersion.content} />

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata card */}
          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <Layers className="h-3.5 w-3.5" />
              {t("sheet")}
            </h3>

            <div className="mt-5 space-y-5">
              {/* Author */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{t("artisan")}</span>
                <div className="flex items-center gap-2">
                  {lokum.author.image ? (
                    <img
                      src={lokum.author.image}
                      alt=""
                      className="h-6 w-6 rounded-full ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
                      <User className="h-3 w-3 text-accent" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-text-primary">
                    {lokum.author.name}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Version */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{t("version")}</span>
                <span className="rounded-lg bg-accent/10 px-2.5 py-1 font-mono text-sm font-medium text-accent">
                  v{latestVersion.version}
                </span>
              </div>

              <div className="h-px bg-border" />

              {/* Last bake date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-muted">{t("lastBatch")}</span>
                <span className="flex items-center gap-1.5 text-sm text-text-primary">
                  <Clock className="h-3.5 w-3.5 text-text-muted" />
                  {new Date(latestVersion.createdAt).toLocaleDateString(
                    locale === "en" ? "en-US" : "fr-FR",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </span>
              </div>

              {/* Install count */}
              {lokum.installCount > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">{t("installs", { count: lokum.installCount })}</span>
                    <span className="flex items-center gap-1.5 text-sm text-text-primary">
                      <Download className="h-3.5 w-3.5 text-text-muted" />
                      {lokum.installCount}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Ingredients / Tags */}
          {lokum.tags.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Tag className="h-3.5 w-3.5" />
                {t("ingredients")}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {lokum.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* In boxes */}
          {containingKoutis.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <Package className="h-3.5 w-3.5" />
                {t("inBoxes")}
              </h3>
              <div className="mt-3 space-y-1.5">
                {containingKoutis.map((ks) => (
                  <Link
                    key={ks.kouti.slug}
                    href={`/koutis/${ks.kouti.slug}`}
                    className="block rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
                  >
                    {ks.kouti.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related content */}
          <RelatedContent type="skill" id={lokum.id} />

          {/* Backlinks */}
          <BacklinksList type="skill" id={lokum.id} />
        </div>
      </div>
    </div>
  );
}
