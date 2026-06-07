import Link from "next/link";
import { getRelatedContent } from "@/lib/actions/links";
import { formatSkillName } from "@/lib/format-skill";
import { getTranslations } from "next-intl/server";

interface BacklinksListProps {
  type: "skill" | "source" | "kouti";
  id: string;
}

export async function BacklinksList({ type, id }: BacklinksListProps) {
  const t = await getTranslations("related");
  const items = await getRelatedContent(type, id, 20);
  const mentions = items.filter((i) => i.linkTypes.includes("mention"));

  if (mentions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {t("mentionedIn")}
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {mentions.map((item) => {
          const href =
            item.type === "skill"
              ? `/lokums/${item.slug}`
              : item.type === "kouti"
                ? `/koutis/${item.slug}`
                : "/garde-manger";
          return (
            <Link
              key={`${item.type}-${item.id}`}
              href={href}
              className="rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary"
            >
              {item.type === "skill" ? formatSkillName(item.name) : item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
