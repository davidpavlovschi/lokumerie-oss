"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Youtube,
  Github,
  Twitter,
  Link as LinkIcon,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import type { Source, User } from "@prisma/client";
import { BilletModal } from "./BilletModal";

const typeIcons: Record<string, { icon: typeof Youtube; color: string }> = {
  youtube: { icon: Youtube, color: "#ff0000" },
  twitter: { icon: Twitter, color: "#1da1f2" },
  github: { icon: Github, color: "#4a7c59" },
  billet: { icon: StickyNote, color: "#d4a017" },
  other: { icon: LinkIcon, color: "#d4a373" },
};

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

interface SourceTableProps {
  sources: (Source & { author: Pick<User, "name"> })[];
  currentUserId?: string;
}

export function SourceTable({ sources }: SourceTableProps) {
  const t = useTranslations("table");
  const [readingSource, setReadingSource] = useState<(Source & { author: Pick<User, "name"> }) | null>(null);

  return (
    <>
      {readingSource && (
        <BilletModal source={readingSource} onClose={() => setReadingSource(null)} />
      )}
      <div className="overflow-x-auto rounded-2xl border border-border bg-bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("type")}</span>
              </th>
              <th className="px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("title")}</span>
              </th>
              <th className="px-4 py-3 hidden md:table-cell">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("domain")}</span>
              </th>
              <th className="px-4 py-3 hidden md:table-cell">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("tags")}</span>
              </th>
              <th className="px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("author")}</span>
              </th>
              <th className="px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{t("date")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => {
              const config = typeIcons[source.sourceType] ?? typeIcons.other;
              const Icon = config.icon;
              const isBillet = source.sourceType === "billet";

              return (
                <tr
                  key={source.id}
                  onClick={() => {
                    if (isBillet) {
                      setReadingSource(source);
                    } else if (source.url) {
                      window.open(source.url, "_blank");
                    }
                  }}
                  className="border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-overlay"
                >
                  <td className="px-4 py-3">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ backgroundColor: config.color + "12" }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-primary line-clamp-1">{source.title}</span>
                      {!isBillet && source.url && (
                        <ExternalLink className="h-3 w-3 shrink-0 text-text-muted" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-text-muted">
                      {source.url ? getDomain(source.url) : source.origin ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {source.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-md bg-overlay-hover px-1.5 py-0.5 text-[10px] text-text-muted">
                          {tag}
                        </span>
                      ))}
                      {source.tags.length > 2 && (
                        <span className="text-[10px] text-text-muted">+{source.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-muted">{source.author.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-muted">
                      {new Date(source.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
