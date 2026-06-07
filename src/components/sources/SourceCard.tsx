"use client";

import { useState, useTransition } from "react";
import {
  ExternalLink,
  Trash2,
  Pencil,
  Youtube,
  Github,
  Twitter,
  Link as LinkIcon,
  X,
  Check,
  Loader2,
  ChevronDown,
  StickyNote,
  Expand,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Source, User } from "@prisma/client";
import { deleteSource, updateSource } from "@/lib/actions/sources";
import { useTranslations } from "next-intl";
import { BilletModal } from "./BilletModal";

const typeConfig = {
  youtube: { icon: Youtube, color: "#ff0000", label: "YouTube" },
  twitter: { icon: Twitter, color: "#1da1f2", label: "X" },
  github: { icon: Github, color: "#4a7c59", label: "GitHub" },
  billet: { icon: StickyNote, color: "#d4a017", label: "Billet" },
  other: { icon: LinkIcon, color: "#d4a373", label: "Lien" },
};

const SUGGESTED_TAGS = [
  "marketing", "development", "ai", "design", "devops", "analytics",
  "seo", "ux", "backend", "frontend", "mobile", "api",
  "database", "product", "growth", "automation", "saas", "open-source",
];

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return ""; }
}

interface SourceCardProps {
  source: Source & { author: Pick<User, "name"> };
  index: number;
  currentUserId?: string;
}

export function SourceCard({ source, index, currentUserId }: SourceCardProps) {
  const config = typeConfig[source.sourceType as keyof typeof typeConfig] ?? typeConfig.other;
  const Icon = config.icon;
  const isBillet = source.sourceType === "billet";
  const youtubeId = source.sourceType === "youtube" && source.url ? getYoutubeId(source.url) : null;
  const hasPreview = youtubeId || source.ogImage;
  const isOwner = currentUserId === source.authorId;
  const t = useTranslations("sources");

  const [editing, setEditing] = useState(false);
  const [reading, setReading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(source.title);
  const [description, setDescription] = useState(source.description ?? "");
  const [editContent, setEditContent] = useState(source.content ?? "");
  const [editOrigin, setEditOrigin] = useState(source.origin ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(source.tags);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function cancelEdit() {
    setEditing(false);
    setTitle(source.title);
    setDescription(source.description ?? "");
    setEditContent(source.content ?? "");
    setEditOrigin(source.origin ?? "");
    setSelectedTags(source.tags);
    setShowAllTags(false);
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("tags", selectedTags.join(","));
    if (isBillet) {
      formData.set("content", editContent);
      formData.set("origin", editOrigin);
    }
    startTransition(async () => {
      await updateSource(source.id, formData);
      setEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSource(source.id);
    });
  }

  const visibleTags = showAllTags ? SUGGESTED_TAGS : SUGGESTED_TAGS.slice(0, 8);

  // ── Edit mode ──
  if (editing) {
    return (
      <div
        className="animate-stagger overflow-hidden rounded-2xl border border-accent/20 bg-bg-surface shadow-[0_0_0_1px_rgba(var(--accent-rgb),0.06)]"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {!isBillet && youtubeId ? (
          <div className="aspect-video w-full bg-bg-base">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        ) : !isBillet && source.ogImage ? (
          <div className="h-[140px] w-full bg-bg-base overflow-hidden">
            <img src={source.ogImage} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="p-4 space-y-3">
          {!isBillet && source.url ? (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Icon className="h-3 w-3" style={{ color: config.color }} />
              <span className="truncate">{getDomain(source.url)}</span>
            </div>
          ) : null}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titleLabel")}
            className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-border-hover"
          />

          {isBillet ? (
            <>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={t("noteContent")}
                rows={4}
                className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-border-hover resize-none"
              />
              <input
                value={editOrigin}
                onChange={(e) => setEditOrigin(e.target.value)}
                placeholder={t("originPlaceholder")}
                className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-border-hover"
              />
            </>
          ) : (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descOptional")}
              rows={2}
              className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-border-hover resize-none"
            />
          )}

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">{t("tags")}</label>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                      active
                        ? "bg-accent/15 border border-accent/30 text-accent"
                        : "bg-bg-base border border-border text-text-secondary hover:border-border-hover"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {!showAllTags && SUGGESTED_TAGS.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags(true)}
                  className="flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] text-text-muted hover:text-text-secondary"
                >
                  <ChevronDown className="h-2.5 w-2.5" />
                  +{SUGGESTED_TAGS.length - 8}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent/15 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              {t("save")}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
            >
              <X className="h-3 w-3" />
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── View mode ──
  return (
    <>
      {reading && (
        <BilletModal source={source} onClose={() => setReading(false)} />
      )}
      <div
        className={`animate-stagger group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface transition-all duration-300 hover:border-border-hover hover:shadow-[0_8px_40px_rgba(var(--accent-rgb),0.04)] ${isBillet ? "cursor-pointer" : ""}`}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={isBillet ? () => setReading(true) : undefined}
      >
        {/* Preview image (links only) */}
        {!isBillet && youtubeId ? (
          <div className="aspect-video w-full bg-bg-base">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        ) : !isBillet && source.ogImage ? (
          <a href={source.url!} target="_blank" rel="noopener noreferrer" className="block">
            <div className="h-[140px] w-full bg-bg-base overflow-hidden">
              <img
                src={source.ogImage}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.style.display = "none";
                }}
              />
            </div>
          </a>
        ) : null}

        <div className={`flex flex-1 flex-col p-4 ${!hasPreview && !isBillet ? "pt-4" : ""}`}>
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: config.color + "12" }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              {isBillet ? (
                <div>
                  <span className="text-sm font-medium text-text-primary line-clamp-1">
                    {source.title}
                  </span>
                  {source.origin && (
                    <span className="mt-0.5 block text-xs text-text-muted">via {source.origin}</span>
                  )}
                </div>
              ) : (
                <>
                  <a
                    href={source.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center gap-1.5"
                  >
                    <span className="truncate text-sm font-medium text-text-primary transition-colors group-hover/link:text-accent">
                      {source.title}
                    </span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-text-muted opacity-0 transition-opacity group-hover/link:opacity-100" />
                  </a>
                  {source.url && (
                    <span className="text-xs text-text-muted">{getDomain(source.url)}</span>
                  )}
                </>
              )}
            </div>
            {isBillet && (
              <Expand className="h-3.5 w-3.5 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>

          {/* Billet content preview */}
          {isBillet && source.content && (
            <div className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-text-secondary overflow-hidden">
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-ol:my-0.5 prose-li:my-0 prose-headings:text-text-primary prose-headings:text-sm prose-headings:my-1 prose-a:text-accent [&>*:first-child]:mt-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {source.content}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Description (links only) */}
          {!isBillet && source.description && (
            <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
              {source.description}
            </p>
          )}

          {/* Tags */}
          {source.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {source.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 mt-3 border-t border-border">
            <span className="text-xs text-text-muted">{source.author.name}</span>
            {isOwner && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-lg p-1.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-bg-hover hover:text-text-primary"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                {confirming ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      className="rounded-lg px-2 py-1 text-[11px] font-medium text-accent-secondary bg-accent-secondary/10 hover:bg-accent-secondary/20 transition-colors"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : t("save") === "Save" ? "Yes" : "Oui"}
                    </button>
                    <button
                      onClick={() => setConfirming(false)}
                      className="rounded-lg px-2 py-1 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {t("save") === "Save" ? "No" : "Non"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(true)}
                    className="rounded-lg p-1.5 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-accent-secondary/10 hover:text-accent-secondary"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
