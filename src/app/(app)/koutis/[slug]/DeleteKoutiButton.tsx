"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteKouti } from "@/lib/actions/koutis";
import { useTranslations } from "next-intl";

export function DeleteKoutiButton({ koutiId }: { koutiId: string }) {
  const [confirming, setConfirming] = useState(false);
  const t = useTranslations("koutis");

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-accent-secondary">{t("deleteConfirm")}</span>
        <button
          onClick={() => deleteKouti(koutiId)}
          className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          {t("yes")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg bg-overlay-hover px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-secondary"
        >
          {t("no")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-text-muted transition-all hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
