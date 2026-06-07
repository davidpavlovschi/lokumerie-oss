"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Info } from "lucide-react";
import { FLAVORS, flavorKeys } from "@/lib/flavors";
import { useTranslations } from "next-intl";

interface LokumFiltersProps {
  artisans: { id: string; name: string | null }[];
}

export function LokumFilters({ artisans }: LokumFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLegend, setShowLegend] = useState(false);
  const legendRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("filters");

  useEffect(() => {
    if (!showLegend) return;
    function handleClick(e: MouseEvent) {
      if (legendRef.current && !legendRef.current.contains(e.target as Node)) {
        setShowLegend(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLegend]);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/lokums?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent" />
        <input
          type="text"
          placeholder={t("search")}
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => update("q", e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all focus:border-border-hover focus:bg-bg-elevated focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.04)]"
        />
      </div>

      {/* Flavor select + info */}
      <div className="relative flex items-center gap-1" ref={legendRef}>
        <div className="relative">
          <select
            defaultValue={searchParams.get("flavor") ?? ""}
            onChange={(e) => update("flavor", e.target.value)}
            className="appearance-none rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 pr-8 text-sm text-text-secondary outline-none transition-all hover:border-border-hover focus:border-border-hover focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.04)]"
          >
            <option value="">{t("allFlavors")}</option>
            {flavorKeys.map((key) => (
              <option key={key} value={key}>
                {FLAVORS[key].label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
        </div>
        <button
          type="button"
          onClick={() => setShowLegend(!showLegend)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-surface text-text-muted transition-all hover:border-border-hover hover:text-text-secondary"
          aria-label={t("flavorsLegend")}
        >
          <Info className="h-3.5 w-3.5" />
        </button>

        {showLegend && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-bg-elevated shadow-lg p-3 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-2">
              {t("flavorsLegend")}
            </p>
            {flavorKeys.map((key) => {
              const f = FLAVORS[key];
              return (
                <div key={key} className="flex items-center gap-2.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="text-xs font-medium text-text-primary w-16">{f.label}</span>
                  <span className="text-xs text-text-muted">{f.hint}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort select */}
      <div className="relative">
        <select
          defaultValue={searchParams.get("sort") ?? ""}
          onChange={(e) => update("sort", e.target.value)}
          className="appearance-none rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 pr-8 text-sm text-text-secondary outline-none transition-all hover:border-border-hover focus:border-border-hover focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.04)]"
        >
          <option value="">Recent</option>
          <option value="popular">{t("popular")}</option>
        </select>
        <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
      </div>

      {/* Artisan select */}
      <div className="relative">
        <select
          defaultValue={searchParams.get("artisan") ?? ""}
          onChange={(e) => update("artisan", e.target.value)}
          className="appearance-none rounded-xl border border-border bg-bg-surface px-3.5 py-2.5 pr-8 text-sm text-text-secondary outline-none transition-all hover:border-border-hover focus:border-border-hover focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.04)]"
        >
          <option value="">{t("allArtisans")}</option>
          {artisans.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <SlidersHorizontal className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}
