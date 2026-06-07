"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "grid";

  function setView(v: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "grid") {
      params.delete("view");
    } else {
      params.set("view", v);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border bg-bg-surface p-0.5">
      <button
        onClick={() => setView("grid")}
        className={`rounded-lg p-2 transition-all ${
          view === "grid"
            ? "bg-bg-elevated text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setView("table")}
        className={`rounded-lg p-2 transition-all ${
          view === "table"
            ? "bg-bg-elevated text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        <List className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
