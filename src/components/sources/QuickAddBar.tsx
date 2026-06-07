"use client";

import { useRef, useState, useTransition } from "react";
import {
  Link as LinkIcon,
  Loader2,
  X,
  ChevronDown,
  StickyNote,
} from "lucide-react";
import { quickAddSource, quickAddBillet } from "@/lib/actions/sources";
import { useTranslations } from "next-intl";

interface OgData {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

const SUGGESTED_TAGS = [
  "marketing",
  "development",
  "ai",
  "design",
  "devops",
  "analytics",
  "seo",
  "ux",
  "backend",
  "frontend",
  "mobile",
  "api",
  "database",
  "product",
  "growth",
  "automation",
  "saas",
  "open-source",
];

const ORIGIN_OPTIONS = ["Twitter", "Grok", "Reddit", "Prompt", "Autre"];

type Mode = "lien" | "billet";

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

export function QuickAddBar() {
  const formRef = useRef<HTMLFormElement>(null);
  const fetchController = useRef<AbortController | null>(null);
  const t = useTranslations("sources");
  const [mode, setMode] = useState<Mode>("lien");
  const [url, setUrl] = useState("");
  const [og, setOg] = useState<OgData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [billetContent, setBilletContent] = useState("");
  const [origin, setOrigin] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function fetchOg(rawUrl: string) {
    fetchController.current?.abort();
    const controller = new AbortController();
    fetchController.current = controller;

    setFetching(true);
    try {
      const res = await fetch(
        `/api/og-metadata?url=${encodeURIComponent(rawUrl)}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error("fetch failed");
      const data: OgData = await res.json();
      if (controller.signal.aborted) return;
      setOg(data);
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
    } catch (error: unknown) {
      if (isAbortError(error)) return;
      setOg(null);
    } finally {
      if (!controller.signal.aborted) setFetching(false);
    }
  }

  function expandWithUrl(rawUrl: string) {
    setExpanded(true);
    fetchOg(rawUrl);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    try {
      const u = new URL(pasted);
      if (u.protocol === "http:" || u.protocol === "https:") {
        setUrl(pasted);
        expandWithUrl(pasted);
        e.preventDefault();
      }
    } catch {}
  }

  function handleUrlChange(value: string) {
    setUrl(value);
  }

  function handleUrlBlur() {
    if (!expanded && url) {
      try {
        const u = new URL(url);
        if (u.protocol === "http:" || u.protocol === "https:") {
          expandWithUrl(url);
        }
      } catch {}
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function reset() {
    fetchController.current?.abort();
    setUrl("");
    setOg(null);
    setExpanded(false);
    setTitle("");
    setDescription("");
    setBilletContent("");
    setOrigin("");
    setSelectedTags([]);
    setShowAllTags(false);
    setError(null);
    formRef.current?.reset();
  }

  function switchMode(newMode: Mode) {
    reset();
    setMode(newMode);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    setError(null);

    if (mode === "lien") {
      if (!url) return;
      const formData = new FormData();
      formData.set("url", url);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("tags", selectedTags.join(","));
      if (og?.image) formData.set("ogImage", og.image);

      startTransition(async () => {
        try {
          await quickAddSource(formData);
          reset();
        } catch {
          setError(t("errorAdd"));
        }
      });
    } else {
      if (!billetContent.trim()) return;
      const formData = new FormData();
      formData.set("content", billetContent);
      formData.set("title", title);
      formData.set("origin", origin);
      formData.set("tags", selectedTags.join(","));

      startTransition(async () => {
        try {
          await quickAddBillet(formData);
          reset();
        } catch {
          setError(t("errorAdd"));
        }
      });
    }
  }

  const visibleTags = showAllTags ? SUGGESTED_TAGS : SUGGESTED_TAGS.slice(0, 8);
  const canSubmit = mode === "lien" ? !!url : !!billetContent.trim();

  return (
    <div className="rounded-2xl border border-border bg-bg-surface transition-all">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-2 pb-0">
        <button
          type="button"
          onClick={() => switchMode("lien")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "lien"
              ? "bg-bg-elevated text-text-primary border border-border"
              : "text-text-muted hover:text-text-secondary border border-transparent"
          }`}
        >
          <LinkIcon className="h-3 w-3" />
          {t("link")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("billet")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            mode === "billet"
              ? "bg-bg-elevated text-text-primary border border-border"
              : "text-text-muted hover:text-text-secondary border border-transparent"
          }`}
        >
          <StickyNote className="h-3 w-3" />
          {t("note")}
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        {mode === "lien" ? (
          <>
            {/* URL input row */}
            <div className="relative flex items-center">
              <div className="absolute left-4">
                <LinkIcon className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onPaste={handlePaste}
                onBlur={handleUrlBlur}
                placeholder={t("pasteLink")}
                className="w-full bg-transparent py-4 pl-11 pr-28 text-sm text-text-primary placeholder:text-text-muted/60 outline-none"
              />
              {expanded && (
                <button
                  type="button"
                  onClick={reset}
                  className="absolute right-20 p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isPending || !url}
                className="absolute right-3 rounded-xl bg-accent/10 border border-accent/20 px-4 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent/15 disabled:opacity-40"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  t("add")
                )}
              </button>
            </div>

            {/* Expanded form */}
            {expanded && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                {/* OG Preview card */}
                {fetching ? (
                  <div className="flex items-center gap-3 rounded-xl bg-bg-base border border-border p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
                    <span className="text-sm text-text-muted">
                      {t("loadingPreview")}
                    </span>
                  </div>
                ) : og && (og.image || og.title) ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-bg-base flex max-h-[180px]">
                    {og.image && (
                      <div className="w-[200px] shrink-0 bg-bg-elevated">
                        <img
                          src={og.image}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).parentElement!.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-3.5 min-w-0 flex flex-col justify-center">
                      {og.siteName && (
                        <p className="text-[11px] uppercase tracking-wider text-text-muted">
                          {og.siteName}
                        </p>
                      )}
                      {og.title && (
                        <p className="mt-0.5 text-sm font-medium text-text-primary line-clamp-2">
                          {og.title}
                        </p>
                      )}
                      {og.description && (
                        <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                          {og.description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Editable fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      {t("titleLabel")}
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("titlePlaceholder")}
                      className="w-full rounded-xl border border-border bg-bg-base px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none transition-colors focus:border-border-hover"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      {t("descLabel")}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("descPlaceholder")}
                      rows={2}
                      className="w-full rounded-xl border border-border bg-bg-base px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none transition-colors focus:border-border-hover resize-none"
                    />
                  </div>
                </div>

                {/* Tags */}
                <TagPicker
                  visibleTags={visibleTags}
                  selectedTags={selectedTags}
                  toggleTag={toggleTag}
                  showAllTags={showAllTags}
                  setShowAllTags={setShowAllTags}
                  totalTags={SUGGESTED_TAGS.length}
                />
              </div>
            )}
          </>
        ) : (
          /* Billet mode */
          <div className="px-4 pb-4 pt-3 space-y-4">
            <div>
              <textarea
                value={billetContent}
                onChange={(e) => setBilletContent(e.target.value)}
                placeholder={t("notePlaceholder")}
                rows={4}
                className="w-full rounded-xl border border-border bg-bg-base px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none transition-colors focus:border-border-hover resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  {t("titleOptional")}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("autoGenerated")}
                  className="w-full rounded-xl border border-border bg-bg-base px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 outline-none transition-colors focus:border-border-hover"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  {t("origin")}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ORIGIN_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOrigin(origin === o ? "" : o)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        origin === o
                          ? "bg-accent/15 border border-accent/30 text-accent"
                          : "bg-bg-base border border-border text-text-secondary hover:border-border-hover"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <TagPicker
              visibleTags={visibleTags}
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              showAllTags={showAllTags}
              setShowAllTags={setShowAllTags}
              totalTags={SUGGESTED_TAGS.length}
            />

            <button
              type="submit"
              disabled={isPending || !canSubmit}
              className="w-full rounded-xl bg-accent/10 border border-accent/20 px-4 py-2 text-xs font-medium text-accent transition-all hover:bg-accent/15 disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
              ) : (
                t("addNote")
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-4 mb-3 rounded-lg bg-accent-secondary/10 border border-accent-secondary/20 px-3 py-2 text-xs text-accent-secondary">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

function TagPicker({
  visibleTags,
  selectedTags,
  toggleTag,
  showAllTags,
  setShowAllTags,
  totalTags,
}: {
  visibleTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  showAllTags: boolean;
  setShowAllTags: (v: boolean) => void;
  totalTags: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                active
                  ? "bg-accent/15 border border-accent/30 text-accent"
                  : "bg-bg-base border border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
              }`}
            >
              {tag}
            </button>
          );
        })}
        {!showAllTags && totalTags > 8 && (
          <button
            type="button"
            onClick={() => setShowAllTags(true)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <ChevronDown className="h-3 w-3" />
            +{totalTags - 8}
          </button>
        )}
      </div>
    </div>
  );
}
