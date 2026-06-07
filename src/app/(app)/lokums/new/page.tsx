import { SkillDropZone } from "./SkillDropZone";
import { getTranslations } from "next-intl/server";

export default async function EnfournerPage() {
  const t = await getTranslations("lokumNew");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-text-primary">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {t("subtitle")}
      </p>

      <div className="mt-8">
        <SkillDropZone />
      </div>
    </div>
  );
}
