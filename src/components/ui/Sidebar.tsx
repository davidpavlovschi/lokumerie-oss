"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Archive, Terminal, LogOut, Menu, X, Newspaper, Package } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { NotificationBell } from "./NotificationBell";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface SidebarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  theme: string;
}

export function Sidebar({ user, theme }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("sidebar");

  const navItems = [
    { href: "/lokums", label: t("etalage"), icon: Store, desc: t("etalageDesc") },
    { href: "/koutis", label: t("koutis"), icon: Package, desc: t("koutisDesc") },
    { href: "/garde-manger", label: t("gardeManger"), icon: Archive, desc: t("gardeMangerDesc") },
    { href: "/journal", label: t("journal"), icon: Newspaper, desc: t("journalDesc") },
    { href: "/settings", label: t("cliApi"), icon: Terminal, desc: t("cliApiDesc") },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-2xl bg-bg-surface/90 p-2.5 backdrop-blur-sm border border-border md:hidden"
      >
        <Menu className="h-4 w-4 text-text-primary" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-bg-surface/95 backdrop-blur-xl border-r border-border transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <Link href="/lokums" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
              <span className="font-display text-sm text-accent">L</span>
            </div>
            <div>
              <span className="font-display text-base text-text-primary tracking-tight">Lokumerie</span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-text-muted">{t("skillAtelier")}</span>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="absolute top-6 right-4 md:hidden">
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "bg-accent/8 text-accent"
                    : "text-text-secondary hover:bg-overlay-hover hover:text-text-primary"
                }`}
              >
                <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"}`} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium leading-tight">{item.label}</span>
                  <span className={`text-[10px] leading-tight ${isActive ? "text-accent/50" : "text-text-muted"}`}>{item.desc}</span>
                </div>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Notifications + Theme + Locale */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <NotificationBell />
          <ThemeSwitcher current={theme} />
          <LocaleSwitcher />
        </div>

        {/* User */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img src={user.image} alt="" className="h-8 w-8 rounded-2xl object-cover ring-1 ring-border" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-accent/10 text-xs font-medium text-accent ring-1 ring-accent/20">
                {user.name?.[0] ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="block truncate text-[13px] text-text-primary">{user.name}</span>
              <span className="text-[10px] text-text-muted">{t("artisan")}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl p-1.5 text-text-muted transition-colors hover:bg-overlay-hover hover:text-accent-secondary"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
