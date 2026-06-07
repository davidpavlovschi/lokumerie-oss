"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SourceFiltersProps {
  artisans: { id: string; name: string | null }[];
}

export function SourceFilters({ artisans }: SourceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/garde-manger?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Chercher une ressource..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => update("q", e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-elevated py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-border-hover"
        />
      </div>

      <select
        defaultValue={searchParams.get("artisan") ?? ""}
        onChange={(e) => update("artisan", e.target.value)}
        className="rounded-xl border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-border-hover"
      >
        <option value="">Tous les artisans</option>
        {artisans.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
