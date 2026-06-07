"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/lib/actions/locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  async function switchTo(newLocale: string) {
    await setLocale(newLocale);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-bg-base border border-border p-0.5">
      <button
        onClick={() => switchTo("fr")}
        className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
          locale === "fr"
            ? "bg-accent/15 text-accent"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => switchTo("en")}
        className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
          locale === "en"
            ? "bg-accent/15 text-accent"
            : "text-text-muted hover:text-text-secondary"
        }`}
      >
        EN
      </button>
    </div>
  );
}
