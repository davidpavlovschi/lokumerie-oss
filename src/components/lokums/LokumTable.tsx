"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import { formatSkillName, cleanDescription } from "@/lib/format-skill";
import { ArrowUpDown, Download } from "lucide-react";
import type { Skill, User } from "@prisma/client";

interface LokumTableProps {
  lokums: (Skill & { author: Pick<User, "name" | "image"> })[];
}

type SortKey = "name" | "flavor" | "updatedAt" | "installCount";
type SortDir = "asc" | "desc";

export function LokumTable({ lokums }: LokumTableProps) {
  const router = useRouter();
  const t = useTranslations("table");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const sorted = [...lokums].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "name":
        return dir * a.name.localeCompare(b.name);
      case "flavor":
        return dir * a.flavor.localeCompare(b.flavor);
      case "updatedAt":
        return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      case "installCount":
        return dir * (a.installCount - b.installCount);
      default:
        return 0;
    }
  });

  function SortHeader({ label, sortKey: key }: { label: string; sortKey: SortKey }) {
    return (
      <button
        onClick={() => toggleSort(key)}
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === key ? "text-accent" : ""}`} />
      </button>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-bg-surface">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3"><SortHeader label={t("name")} sortKey="name" /></th>
            <th className="px-4 py-3"><SortHeader label={t("flavor")} sortKey="flavor" /></th>
            <th className="px-4 py-3 hidden md:table-cell">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("description")}</span>
            </th>
            <th className="px-4 py-3 hidden md:table-cell">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("tags")}</span>
            </th>
            <th className="px-4 py-3"><SortHeader label={t("updated")} sortKey="updatedAt" /></th>
            <th className="px-4 py-3"><SortHeader label={t("install")} sortKey="installCount" /></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((lokum) => (
            <tr
              key={lokum.id}
              onClick={() => router.push(`/lokums/${lokum.slug}`)}
              className="border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-overlay"
            >
              <td className="px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-text-primary">{formatSkillName(lokum.name)}</span>
                  <span className="block text-[11px] text-text-muted">{lokum.author.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <FlavorBadge flavor={lokum.flavor} />
              </td>
              <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                <span className="text-xs text-text-secondary line-clamp-1">
                  {cleanDescription(lokum.description)}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {lokum.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-md bg-overlay-hover px-1.5 py-0.5 text-[10px] text-text-muted">
                      {tag}
                    </span>
                  ))}
                  {lokum.tags.length > 2 && (
                    <span className="text-[10px] text-text-muted">+{lokum.tags.length - 2}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-text-muted">
                  {new Date(lokum.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1 font-mono text-xs text-text-muted">
                  <Download className="h-3 w-3" />
                  {lokum.installCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
