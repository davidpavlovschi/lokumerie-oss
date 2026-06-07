"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { formatSkillName, cleanDescription } from "@/lib/format-skill";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import Link from "next/link";

interface SemanticResult {
  id: string;
  name: string;
  slug: string;
  flavor: string;
  tags: string[];
  description: string | null;
  installCount: number;
  author: string | null;
  similarity: number | null;
}

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SemanticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `/api/skills/semantic-search?q=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setError(null);
      } else {
        setResults([]);
        setError("Search failed. Try again.");
      }
    } catch {
      setError("Search unavailable.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    search(query);
  };

  const clearAndReset = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Sparkles className="absolute left-4 h-4 w-4 text-accent/60" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need... (e.g. 'help me write better tests')"
            className="w-full rounded-2xl border border-border bg-bg-surface/80 backdrop-blur-sm py-3 pl-11 pr-24 text-sm text-text-primary placeholder:text-text-muted/50 outline-none transition-all duration-200 focus:border-accent/30 focus:bg-bg-surface focus:shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.06)]"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={clearAndReset}
                className="rounded-lg px-2 py-1 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={loading || query.length < 2}
              className="flex items-center gap-1.5 rounded-xl bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent/15 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Search className="h-3 w-3" />
              )}
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && searched && !loading && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-8 text-center">
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      )}

      {/* No results */}
      {searched && !loading && !error && results.length === 0 && (
        <div className="rounded-2xl border border-border bg-bg-surface/60 backdrop-blur-sm p-8 text-center">
          <p className="text-sm text-text-muted">
            No matching skills found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted px-1">
            {results.length} result{results.length !== 1 ? "s" : ""}
            {results[0].similarity !== null && " by relevance"}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result, i) => (
              <Link
                key={result.id}
                href={`/lokums/${result.slug}`}
                className="animate-stagger group relative flex flex-col rounded-2xl border border-border bg-bg-surface/80 backdrop-blur-sm p-4 transition-all duration-200 hover:border-border-hover hover:bg-bg-surface hover:shadow-[0_4px_24px_rgba(var(--accent-rgb),0.04)]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Similarity badge */}
                {result.similarity !== null && (
                  <div className="absolute top-3 right-3">
                    <span className="rounded-md bg-accent/8 border border-accent/10 px-1.5 py-0.5 text-[10px] font-mono text-accent/70">
                      {Math.round(result.similarity * 100)}%
                    </span>
                  </div>
                )}

                {/* Name + author */}
                <div className="pr-12">
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                    {formatSkillName(result.name)}
                  </h3>
                  {result.author && (
                    <span className="text-[11px] text-text-muted">
                      {result.author}
                    </span>
                  )}
                </div>

                {/* Description */}
                {result.description && (
                  <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-text-secondary">
                    {cleanDescription(result.description)}
                  </p>
                )}

                {/* Footer: flavor + tags */}
                <div className="mt-auto flex items-center gap-2 pt-3 mt-2 border-t border-border/60">
                  <FlavorBadge flavor={result.flavor} />
                  {result.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-overlay-hover px-1.5 py-0.5 text-[10px] text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
