"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Youtube, Github, Twitter, Link as LinkIcon, LayoutGrid, StickyNote } from "lucide-react";
import { useTranslations } from "next-intl";

interface SourceTabsProps {
  counts: Record<string, number>;
  activeType?: string;
}

export function SourceTabs({ counts, activeType }: SourceTabsProps) {
  const searchParams = useSearchParams();
  const t = useTranslations("sources");

  const tabs = [
    { key: undefined, label: t("all"), icon: LayoutGrid },
    { key: "youtube", label: "YouTube", icon: Youtube },
    { key: "github", label: "GitHub", icon: Github },
    { key: "twitter", label: "X", icon: Twitter },
    { key: "billet", label: t("billets"), icon: StickyNote },
    { key: "other", label: t("others"), icon: LinkIcon },
  ] as const;

  function buildHref(type?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    const qs = params.toString();
    return `/garde-manger${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-bg-surface/50 border border-border p-1">
      {tabs.map((tab) => {
        const isActive = activeType === tab.key || (!activeType && !tab.key);
        const count = tab.key ? counts[tab.key] ?? 0 : counts.all ?? 0;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={buildHref(tab.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-bg-elevated text-text-primary shadow-sm border border-border"
                : "text-text-muted hover:text-text-secondary border border-transparent"
            }`}
          >
            <Icon className="h-3 w-3" />
            {tab.label}
            <span className={`ml-0.5 text-[10px] ${isActive ? "text-accent" : "text-text-muted"}`}>
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
