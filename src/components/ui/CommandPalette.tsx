"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Terminal, Archive, Package, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { unifiedSearch } from "@/lib/actions/search";
import { formatSkillName } from "@/lib/format-skill";

type SearchResults = {
  skills: { id: string; name: string; slug: string; flavor: string; author: { name: string | null } }[];
  sources: { id: string; title: string; sourceType: string; url: string | null; author: { name: string | null } }[];
  koutis: { id: string; name: string; slug: string; author: { name: string | null } }[];
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ skills: [], sources: [], koutis: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations("commandPalette");
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ skills: [], sources: [], koutis: [] });
      setSelectedIndex(0);
    }
  }, [open]);

  const allItems = [
    ...results.skills.map((s) => ({ type: "skill" as const, id: s.id, name: formatSkillName(s.name), href: `/lokums/${s.slug}`, author: s.author.name })),
    ...results.koutis.map((k) => ({ type: "kouti" as const, id: k.id, name: k.name, href: `/koutis/${k.slug}`, author: k.author.name })),
    ...results.sources.map((s) => ({ type: "source" as const, id: s.id, name: s.title, href: s.sourceType === "billet" ? "/garde-manger" : (s.url ?? "/garde-manger"), author: s.author.name })),
  ];

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults({ skills: [], sources: [], koutis: [] });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const data = await unifiedSearch(value);
      setResults(data);
    }, 200);
  }, []);

  function handleSelect(index: number) {
    const item = allItems[index];
    if (!item) return;
    if (item.type === "source" && item.href.startsWith("http")) {
      window.open(item.href, "_blank");
    } else {
      router.push(item.href);
    }
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-bg-surface shadow-2xl animate-slideDown overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="flex-1 bg-transparent py-4 text-sm text-text-primary placeholder:text-text-muted/60 outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-text-muted hover:text-text-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        {query.length >= 2 && (
          <div className="max-h-[300px] overflow-y-auto">
            {allItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                {t("noResults")}
              </div>
            ) : (
              <div className="py-2">
                {results.skills.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      {t("skills")}
                    </p>
                    {results.skills.map((skill, i) => (
                      <button
                        key={skill.id}
                        onClick={() => handleSelect(i)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          selectedIndex === i ? "bg-accent/[0.06]" : "hover:bg-overlay"
                        }`}
                      >
                        <Terminal className="h-4 w-4 shrink-0 text-accent/60" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-text-primary truncate block">
                            {formatSkillName(skill.name)}
                          </span>
                          <span className="text-[11px] text-text-muted">{skill.author.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.koutis.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      {t("koutis")}
                    </p>
                    {results.koutis.map((kouti, i) => {
                      const globalIndex = results.skills.length + i;
                      return (
                        <button
                          key={kouti.id}
                          onClick={() => handleSelect(globalIndex)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selectedIndex === globalIndex ? "bg-accent/[0.06]" : "hover:bg-overlay"
                          }`}
                        >
                          <Package className="h-4 w-4 shrink-0 text-accent/60" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-text-primary truncate block">
                              {kouti.name}
                            </span>
                            <span className="text-[11px] text-text-muted">{kouti.author.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {results.sources.length > 0 && (
                  <div>
                    <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                      {t("sources")}
                    </p>
                    {results.sources.map((source, i) => {
                      const globalIndex = results.skills.length + results.koutis.length + i;
                      return (
                        <button
                          key={source.id}
                          onClick={() => handleSelect(globalIndex)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selectedIndex === globalIndex ? "bg-accent/[0.06]" : "hover:bg-overlay"
                          }`}
                        >
                          <Archive className="h-4 w-4 shrink-0 text-accent/60" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-text-primary truncate block">
                              {source.title}
                            </span>
                            <span className="text-[11px] text-text-muted">{source.author.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-[11px] text-text-muted">{t("tip")}</span>
          <kbd className="rounded-md border border-border bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
            Esc
          </kbd>
        </div>
      </div>
    </div>
  );
}
