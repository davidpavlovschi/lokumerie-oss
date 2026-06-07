import { getTranslations } from "next-intl/server";
import { KoutiForm } from "./KoutiForm";

export default async function NewKoutiPage() {
  const t = await getTranslations("koutis");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          {t("createTitle")}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {t("createSubtitle")}
        </p>
      </div>
      <KoutiForm />
    </div>
  );
}
