"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Terminal, Archive, CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { markNotificationsSeen } from "@/lib/actions/notifications";

type NotificationItem = {
  id: string;
  type: "skill" | "source";
  name: string;
  slug: string | null;
  author: string | null;
  createdAt: Date;
  unread: boolean;
};

interface NotificationPanelProps {
  items: NotificationItem[];
  onClose: () => void;
  onMarkRead: () => void;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "<1m";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationPanel({ items, onClose, onMarkRead }: NotificationPanelProps) {
  const t = useTranslations("notifications");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleMarkAllRead() {
    await markNotificationsSeen();
    onMarkRead();
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 rounded-xl border border-border bg-bg-surface/95 backdrop-blur-xl shadow-lg animate-slideDown overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-text-primary">{t("title")}</h3>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 text-[11px] text-text-muted hover:text-accent transition-colors"
        >
          <CheckCheck className="h-3 w-3" />
          {t("markAllRead")}
        </button>
      </div>

      {/* Items */}
      <div className="max-h-[320px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            {t("empty")}
          </div>
        ) : (
          items.slice(0, 20).map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.type === "skill" && item.slug ? `/lokums/${item.slug}` : "/garde-manger"}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-overlay"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/[0.06] mt-0.5">
                {item.type === "skill" ? (
                  <Terminal className="h-3.5 w-3.5 text-accent/70" />
                ) : (
                  <Archive className="h-3.5 w-3.5 text-accent/70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">
                  {item.name}
                </p>
                <p className="text-[11px] text-text-muted">
                  {item.author && t("by", { name: item.author })}
                  <span className="mx-1">·</span>
                  {timeAgo(item.createdAt)}
                </p>
              </div>
              {item.unread && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
