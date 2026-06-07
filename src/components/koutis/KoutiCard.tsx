import Link from "next/link";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import { Package, ArrowUpRight } from "lucide-react";
import type { Kouti, User, KoutiSkill, Skill } from "@prisma/client";

interface KoutiCardProps {
  kouti: Kouti & {
    author: Pick<User, "name" | "image">;
    skills: (KoutiSkill & { skill: Pick<Skill, "name" | "flavor"> })[];
    _count: { skills: number };
  };
  index: number;
}

export function KoutiCard({ kouti, index }: KoutiCardProps) {
  const flavors = [...new Set(kouti.skills.map((ks) => ks.skill.flavor))];

  return (
    <Link
      href={`/koutis/${kouti.slug}`}
      className="animate-stagger group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface transition-all duration-300 hover:border-border-hover hover:shadow-[0_8px_40px_rgba(var(--accent-rgb),0.04)]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/[0.06] transition-colors group-hover:bg-accent/10">
              <Package className="h-4 w-4 text-accent/70" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium leading-tight text-text-primary group-hover:text-accent transition-colors">
                {kouti.name}
              </h3>
              <span className="text-[11px] text-text-muted">{kouti.author.name}</span>
            </div>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:text-accent" />
        </div>

        {kouti.description && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
            {kouti.description}
          </p>
        )}

        {flavors.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {flavors.slice(0, 3).map((flavor) => (
              <FlavorBadge key={flavor} flavor={flavor} />
            ))}
            {flavors.length > 3 && (
              <span className="text-[11px] text-text-muted">+{flavors.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 mt-3 border-t border-border">
          <span className="text-[11px] text-text-muted">
            {kouti._count.skills} skill{kouti._count.skills !== 1 ? "s" : ""}
          </span>
          {kouti.visibility !== "public" && (
            <span className="rounded-md bg-overlay-hover px-2 py-0.5 text-[10px] text-text-muted">
              {kouti.visibility}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
