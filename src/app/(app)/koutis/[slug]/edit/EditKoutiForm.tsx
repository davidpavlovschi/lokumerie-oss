"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateKouti } from "@/lib/actions/koutis";
import { SkillPicker } from "@/components/koutis/SkillPicker";

interface SkillOption {
  id: string;
  name: string;
  slug: string;
  flavor: string;
}

interface EditKoutiFormProps {
  kouti: {
    id: string;
    name: string;
    description: string | null;
    visibility: string;
  };
  existingSkills: SkillOption[];
}

export function EditKoutiForm({ kouti, existingSkills }: EditKoutiFormProps) {
  const t = useTranslations("koutis");
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>(existingSkills);

  const handleSubmit = async (formData: FormData) => {
    await updateKouti(kouti.id, formData);
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("nameLabel")}
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={kouti.name}
          className="w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/40"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("descLabel")}
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={kouti.description ?? ""}
          className="w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/40 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {t("visibilityLabel")}
        </label>
        <select
          name="visibility"
          defaultValue={kouti.visibility}
          className="w-full rounded-xl border border-border bg-bg-base px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent/40"
        >
          <option value="public">{t("visibilityPublic")}</option>
          <option value="unlisted">{t("visibilityUnlisted")}</option>
          <option value="private">{t("visibilityPrivate")}</option>
        </select>
      </div>

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
        {t("save")}
      </button>
    </form>
  );
}
