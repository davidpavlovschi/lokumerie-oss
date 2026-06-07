"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Copy, CheckCheck, StickyNote } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocale } from "next-intl";
import type { Source, User } from "@prisma/client";

interface BilletModalProps {
  source: Source & { author: Pick<User, "name"> };
  onClose: () => void;
}

export function BilletModal({ source, onClose }: BilletModalProps) {
  const [copied, setCopied] = useState(false);
  const locale = useLocale();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  async function handleCopy() {
    if (!source.content) return;
    await navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-bg-surface shadow-2xl animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border px-6 py-4 shrink-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5"
            style={{ backgroundColor: "#d4a01712" }}
          >
            <StickyNote className="h-4 w-4" style={{ color: "#d4a017" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-medium text-text-primary leading-tight">
              {source.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {source.origin && (
                <span className="inline-flex items-center rounded-md bg-accent/10 border border-accent/20 px-2 py-0.5 text-[11px] font-medium text-accent">
                  via {source.origin}
                </span>
              )}
              <span className="text-xs text-text-muted">{source.author.name}</span>
              <span className="text-xs text-text-muted">
                {new Date(source.createdAt).toLocaleDateString(
                  locale === "en" ? "en-US" : "fr-FR",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-primary transition-all"
            >
              {copied ? (
                <CheckCheck className="h-3.5 w-3.5 text-accent" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-primary transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary prose-headings:text-text-primary prose-headings:font-medium prose-a:text-accent prose-strong:text-text-primary prose-code:text-accent prose-code:bg-bg-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-bg-base prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-blockquote:border-accent/30 prose-blockquote:text-text-muted prose-hr:border-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {source.content ?? ""}
            </ReactMarkdown>
          </div>
        </div>

        {/* Tags footer */}
        {source.tags.length > 0 && (
          <div className="border-t border-border px-6 py-3 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {source.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
