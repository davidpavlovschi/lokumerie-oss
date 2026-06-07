import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Terminal, Shield } from "lucide-react";
import { AuthorizeCliButton } from "./AuthorizeCliButton";
import { getTranslations } from "next-intl/server";

interface Props {
  searchParams: Promise<{ port?: string; state?: string }>;
}

export default async function CliAuthPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const t = await getTranslations("cliAuth");

  const params = await searchParams;
  const port = params.port;

  if (!port || !/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
    return (
      <div className="flex flex-col items-center text-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-secondary/10 border border-accent-secondary/20">
          <Shield className="h-7 w-7 text-accent-secondary" />
        </div>
        <h1 className="mt-6 font-display text-2xl text-text-primary">
          {t("invalidTitle")}
        </h1>
        <p className="mt-2 text-sm text-text-muted max-w-xs">
          {t("invalidDesc")}{" "}
          <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-accent font-mono text-xs">lokum login</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/[0.06] border border-border">
        <Terminal className="h-7 w-7 text-accent" />
      </div>

      <h1 className="mt-6 font-display text-2xl text-text-primary">
        {t("authorizeTitle")}
      </h1>
      <p className="mt-2 text-sm text-text-muted max-w-sm">
        {t("authorizeDesc")}
        <span className="text-text-primary font-medium"> {session.user.name ?? session.user.email}</span>.
      </p>

      <div className="mt-8 w-full max-w-xs space-y-4">
        <div className="rounded-xl border border-border bg-bg-surface p-4 text-left text-xs text-text-secondary space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-pistache" />
            {t("permPush")}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-pistache" />
            {t("permList")}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-pistache" />
            {t("permInstall")}
          </div>
        </div>

        <AuthorizeCliButton port={port} />
      </div>

      <p className="mt-6 text-[11px] text-text-muted">
        {t("keyNote", { target: `localhost:${port}` })}
      </p>
    </div>
  );
}
