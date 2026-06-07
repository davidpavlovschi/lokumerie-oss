"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteLokum } from "@/lib/actions/lokums";
import { useTranslations } from "next-intl";

export function DeleteButton({ skillId }: { skillId: string }) {
  const [confirming, setConfirming] = useState(false);
  const t = useTranslations("lokums");

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-accent-secondary">{t("deleteConfirm")}</span>
        <form action={deleteLokum.bind(null, skillId)}>
          <button
            type="submit"
            className="rounded-lg bg-accent-secondary/20 px-3 py-1.5 text-xs text-accent-secondary hover:bg-accent-secondary/30"
          >
            {t("yes")}
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-lg bg-overlay-strong px-3 py-1.5 text-xs text-text-secondary hover:bg-overlay-stronger"
        >
          {t("no")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-xl border border-border p-2 text-text-secondary transition-colors hover:border-accent-secondary/30 hover:text-accent-secondary"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
