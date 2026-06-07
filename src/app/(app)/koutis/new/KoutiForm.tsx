"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createKouti } from "@/lib/actions/koutis";
import { SkillPicker } from "@/components/koutis/SkillPicker";

interface SkillOption {
  id: string;
  name: string;
  slug: string;
  flavor: string;
}

export function KoutiForm() {
  const t = useTranslations("koutis");
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>([]);

  return (
    <form action={createKouti} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("nameLabel")}
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder={t("namePlaceholder")}
          className="w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-colors focus:border-accent/40"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("descLabel")}
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder={t("descPlaceholder")}
          className="w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-colors focus:border-accent/40 resize-none"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("visibilityLabel")}
        </label>
        <select
          name="visibility"
          defaultValue="public"
          className="w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/40"
        >
          <option value="public">{t("visibilityPublic")}</option>
          <option value="unlisted">{t("visibilityUnlisted")}</option>
          <option value="private">{t("visibilityPrivate")}</option>
        </select>
      </div>

      {/* Skill picker */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("skillsLabel")}
        </label>
        <SkillPicker selected={selectedSkills} onChange={setSelectedSkills} />
      </div>

      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-6 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/15 hover:border-accent/30"
      >
        {t("create")}
      </button>
    </form>
  );
}
