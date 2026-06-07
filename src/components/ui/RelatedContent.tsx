import Link from "next/link";
import { Terminal, Archive, Package } from "lucide-react";
import { getRelatedContent } from "@/lib/actions/links";
import { formatSkillName } from "@/lib/format-skill";
import { getTranslations } from "next-intl/server";

interface RelatedContentProps {
  type: "skill" | "source" | "kouti";
  id: string;
}

const ICONS = {
  skill: Terminal,
  source: Archive,
  kouti: Package,
};

const LINK_TYPE_LABELS: Record<string, string> = {
  tag: "shared tags",
  flavor: "same flavor",
  cooccurrence: "same box",
  mention: "mentioned",
  manual: "curated",
};

export async function RelatedContent({ type, id }: RelatedContentProps) {
  const t = await getTranslations("related");
  const items = await getRelatedContent(type, id, 6);

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {t("title")}
      </h3>
      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const Icon = ICONS[item.type];
          const href =
            item.type === "skill"
              ? `/lokums/${item.slug}`
              : item.type === "kouti"
                ? `/koutis/${item.slug}`
                : "/garde-manger";
          const viaLabel = item.linkTypes
            .map((lt) => LINK_TYPE_LABELS[lt] || lt)
            .join(", ");

          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-overlay"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-accent/60" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-text-primary truncate block">
                  {item.type === "skill" ? formatSkillName(item.name) : item.name}
                </span>
                <span className="text-[10px] text-text-muted">{viaLabel}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
