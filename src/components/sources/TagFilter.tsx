"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tag } from "lucide-react";

interface TagFilterProps {
  tags: { tag: string; count: number }[];
  activeTag?: string;
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  const searchParams = useSearchParams();

  function buildHref(tag?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    const qs = params.toString();
    return `/garde-manger${qs ? `?${qs}` : ""}`;
  }

  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <Tag className="h-3.5 w-3.5 shrink-0 text-text-muted" />
      <Link
        href={buildHref()}
        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
          !activeTag
            ? "bg-accent/15 border border-accent/30 text-accent"
            : "border border-transparent text-text-muted hover:text-text-secondary"
        }`}
      >
        Tous
      </Link>
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={buildHref(tag)}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            activeTag === tag
              ? "bg-accent/15 border border-accent/30 text-accent"
              : "border border-border bg-bg-surface text-text-secondary hover:border-border-hover hover:text-text-primary"
          }`}
        >
          {tag}
          <span className="ml-1.5 text-[10px] text-text-muted">{count}</span>
        </Link>
      ))}
    </div>
  );
}
