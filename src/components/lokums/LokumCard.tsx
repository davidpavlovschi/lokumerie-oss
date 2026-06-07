import Link from "next/link";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import { Terminal, ArrowUpRight, Download } from "lucide-react";
import { formatSkillName, cleanDescription } from "@/lib/format-skill";
import type { Skill, User } from "@prisma/client";

interface LokumCardProps {
  lokum: Skill & { author: Pick<User, "name" | "image">; _count?: { versions: number } };
  index: number;
}

export function LokumCard({ lokum, index }: LokumCardProps) {
  return (
    <Link
      href={`/lokums/${lokum.slug}`}
      className="animate-stagger group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface transition-all duration-300 hover:border-border-hover hover:shadow-[0_8px_40px_rgba(var(--accent-rgb),0.04)]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top accent line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/[0.06] transition-colors group-hover:bg-accent/10">
              <Terminal className="h-4 w-4 text-accent/70" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium leading-tight text-text-primary group-hover:text-accent transition-colors">
                {formatSkillName(lokum.name)}
              </h3>
              <span className="text-[11px] text-text-muted">{lokum.author.name}</span>
            </div>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 group-hover:text-accent" />
        </div>

        {/* Description */}
        {lokum.description && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
            {cleanDescription(lokum.description)}
          </p>
        )}

        {/* Tags */}
        {lokum.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lokum.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-overlay-hover px-2 py-0.5 text-[11px] text-text-muted"
              >
                {tag}
              </span>
            ))}
            {lokum.tags.length > 3 && (
              <span className="text-[11px] text-text-muted">+{lokum.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 mt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <FlavorBadge flavor={lokum.flavor} />
            {lokum.installCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-text-muted">
                <Download className="h-2.5 w-2.5" />
                {lokum.installCount}
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-text-muted">
            lokum install {lokum.slug}
          </span>
        </div>
      </div>
    </Link>
  );
}
