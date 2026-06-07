import { prisma } from "@/lib/prisma";
import { getTranslations, getLocale } from "next-intl/server";
import { formatSkillName } from "@/lib/format-skill";
import Link from "next/link";
import {
  Terminal,
  Archive,
  Layers,
} from "lucide-react";

type TimelineItem = {
  id: string;
  type: "new_skill" | "updated_skill" | "new_source";
  name: string;
  href: string;
  author: string | null;
  date: Date;
  version?: number;
};

export default async function JournalPage() {
  const t = await getTranslations("journal");
  const locale = await getLocale();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [skills, versions, sources] = await Promise.all([
    prisma.skill.findMany({
      where: { createdAt: { gte: since } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.skillVersion.findMany({
      where: { createdAt: { gte: since }, version: { gt: 1 } },
      include: {
        skill: {
          select: { name: true, slug: true, author: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.source.findMany({
      where: { createdAt: { gte: since } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const items: TimelineItem[] = [
    ...skills.map((s) => ({
      id: `skill-${s.id}`,
      type: "new_skill" as const,
      name: formatSkillName(s.name),
      href: `/lokums/${s.slug}`,
      author: s.author.name,
      date: s.createdAt,
    })),
    ...versions.map((v) => ({
      id: `version-${v.id}`,
      type: "updated_skill" as const,
      name: formatSkillName(v.skill.name),
      href: `/lokums/${v.skill.slug}`,
      author: v.skill.author.name,
      date: v.createdAt,
      version: v.version,
    })),
    ...sources.map((s) => ({
      id: `source-${s.id}`,
      type: "new_source" as const,
      name: s.title,
      href: "/garde-manger",
      author: s.author.name,
      date: s.createdAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by date
  const groups = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const key = item.date.toISOString().split("T")[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return t("today");
    if (date.getTime() === yesterday.getTime()) return t("yesterday");
    return date.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  const typeConfig = {
    new_skill: { icon: Terminal, label: t("newSkill"), color: "text-accent" },
    updated_skill: { icon: Layers, label: t("updatedSkill"), color: "text-citron" },
    new_source: { icon: Archive, label: t("newSource"), color: "text-menthe" },
  };

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight text-text-primary">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        {t("subtitle")}
      </p>

      {items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/[0.06] border border-border">
            <Terminal className="h-7 w-7 text-accent/40" />
          </div>
          <p className="mt-5 font-display text-xl text-text-secondary">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Array.from(groups.entries()).map(([dateStr, groupItems]) => (
            <div key={dateStr}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                {formatDateLabel(dateStr)}
              </h2>
              <div className="space-y-1">
                {groupItems.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-overlay"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-surface border border-border`}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {item.name}
                          </span>
                          {item.version && (
                            <span className="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                              v{item.version}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted">
                          {config.label}
                          {item.author && ` · ${item.author}`}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted shrink-0">
                        {item.date.toLocaleTimeString(locale === "en" ? "en-US" : "fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
