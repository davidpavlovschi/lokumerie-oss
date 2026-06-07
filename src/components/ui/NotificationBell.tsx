"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";
import { getNotifications } from "@/lib/actions/notifications";

type NotificationItem = {
  id: string;
  type: "skill" | "source";
  name: string;
  slug: string | null;
  author: string | null;
  createdAt: Date;
  unread: boolean;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications().then((data) => {
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleOpen() {
    if (!open) {
      getNotifications().then((data) => {
        setItems(data.items);
        setUnreadCount(data.unreadCount);
      });
    }
    setOpen(!open);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl text-text-muted transition-all hover:bg-overlay-hover hover:text-text-secondary"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-bg-base">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          items={items}
          onClose={() => setOpen(false)}
          onMarkRead={() => {
            setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
            setUnreadCount(0);
          }}
        />
      )}
    </div>
  );
}
