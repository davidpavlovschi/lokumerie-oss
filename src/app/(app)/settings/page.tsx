import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiKeySection } from "./ApiKeySection";
import { ClaudeSnippet } from "./ClaudeSnippet";
import { Terminal, Download, List, Search, Upload, LogIn, LogOut, UserCheck, History, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const t = await getTranslations("settings");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { apiKey: true },
  });

  let apiKey = user?.apiKey;
  if (!apiKey) {
    apiKey = "lok_" + randomBytes(24).toString("hex");
    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey },
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-tight text-text-primary">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        {t("subtitle")}
      </p>

      {/* Claude Snippet */}
      <div className="mt-8 rounded-3xl border border-accent/20 bg-accent/[0.03] p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent/10">
            <span className="text-sm font-bold text-accent">C</span>
          </div>
          <h2 className="text-sm font-medium text-text-primary">{t("claudeSnippet")}</h2>
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          {t("claudeSnippetDesc")}
        </p>
        <ClaudeSnippet apiKey={apiKey} appUrl={appUrl} />
      </div>

      {/* CLI Installation */}
      <div className="mt-6 rounded-3xl border border-border bg-bg-surface p-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-medium text-text-primary">{t("cliTitle")}</h2>
        </div>
        <p className="mt-1.5 text-xs text-text-muted">
          {t("cliDesc")}
        </p>

        {/* Quick install */}
        <div className="mt-4 rounded-2xl bg-bg-elevated border border-border p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{t("installConnect")}</span>
          <pre className="mt-2 font-mono text-xs text-accent select-all break-all whitespace-pre-wrap">
{`curl -sL ${appUrl}/lokum.sh | LOKUM_API_KEY=${apiKey} bash -s -- setup`}
          </pre>
          <p className="mt-2 text-[11px] text-text-muted">
            {t("installDesc")}
          </p>
        </div>

        <div className="mt-3 rounded-2xl bg-bg-elevated border border-border p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{t("verify")}</span>
          <pre className="mt-2 font-mono text-xs text-accent select-all">lokum list</pre>
        </div>
      </div>

      {/* API Key (manual, fallback) */}
      <div className="mt-6">
        <ApiKeySection hasKey={!!apiKey} />
      </div>

      {/* CLI Commands Reference */}
      <div className="mt-6 rounded-3xl border border-border bg-bg-surface p-6">
        <h2 className="text-sm font-medium text-text-primary">{t("commands")}</h2>
        <p className="mt-1 text-xs text-text-muted">{t("commandsDesc")}</p>

        <div className="mt-5 space-y-3">
          <CommandRow icon={<LogIn className="h-3.5 w-3.5 text-accent" />} name="login" desc={t("cmdLogin")} example="lokum login" />
          <CommandRow icon={<LogOut className="h-3.5 w-3.5 text-accent" />} name="logout" desc={t("cmdLogout")} example="lokum logout" />
          <CommandRow icon={<Upload className="h-3.5 w-3.5 text-accent" />} name="push" desc={t("cmdPush")} example={`lokum push release-checklist.md\nlokum push ~/.codex/skills/my-codex-skill\nlokum push my-codex-skill --changelog="Ajout scripts"`} />
          <CommandRow icon={<List className="h-3.5 w-3.5 text-accent" />} name="list" desc={t("cmdList")} example="lokum list" />
          <CommandRow icon={<Search className="h-3.5 w-3.5 text-accent" />} name="search" desc={t("cmdSearch")} example='lokum search "deploy"' />
          <CommandRow icon={<Download className="h-3.5 w-3.5 text-accent" />} name="install" desc={t("cmdInstall")} example={`lokum install alex-release-checklist\nlokum install alex-release-checklist --version=2`} />
          <CommandRow icon={<History className="h-3.5 w-3.5 text-accent" />} name="versions" desc={t("cmdVersions")} example="lokum versions alex-release-checklist" />
          <CommandRow icon={<UserCheck className="h-3.5 w-3.5 text-accent" />} name="whoami" desc={t("cmdWhoami")} example="lokum whoami" />

          <div className="h-px bg-border my-2" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted px-1">{t("koutiApiTitle")}</p>

          <CommandRow icon={<Package className="h-3.5 w-3.5 text-accent" />} name="GET /api/koutis" desc={t("cmdKoutiList")} example={`curl -H "Authorization: Bearer $LOKUM_API_KEY" ${appUrl}/api/koutis`} />
          <CommandRow icon={<Package className="h-3.5 w-3.5 text-accent" />} name="POST /api/koutis" desc={t("cmdKoutiCreate")} example={`curl -X POST -H "Authorization: Bearer $LOKUM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Team Foundations","skillSlugs":["alex-release-checklist","sam-debug-loop"]}' \\
  ${appUrl}/api/koutis`} />
          <CommandRow icon={<Package className="h-3.5 w-3.5 text-accent" />} name="DELETE /api/koutis" desc={t("cmdKoutiDelete")} example={`curl -X DELETE -H "Authorization: Bearer $LOKUM_API_KEY" \\
  "${appUrl}/api/koutis?slug=alex-team-foundations"`} />
          <CommandRow icon={<Download className="h-3.5 w-3.5 text-accent" />} name="GET /api/koutis/install" desc={t("cmdKoutiBulkInstall")} example={`curl -H "Authorization: Bearer $LOKUM_API_KEY" \\
  "${appUrl}/api/koutis/install?slug=alex-team-foundations"`} />
        </div>
      </div>

      {/* Full script (collapsible) */}
      <details className="mt-6 rounded-3xl border border-border bg-bg-surface p-6 group">
        <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          {t("viewScript")}
        </summary>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-bg-base border border-border p-4 font-mono text-[11px] leading-relaxed text-text-secondary max-h-[400px] overflow-y-auto">
{`#!/bin/bash
# lokum — CLI pour Lokumerie
# curl -sL ${appUrl}/lokum.sh | bash

LOKUM_RC="$HOME/.lokumrc"
LOKUM_URL="\${LOKUM_URL:-${appUrl}}"

# Load saved key from ~/.lokumrc
load_key() {
  if [ -n "$LOKUM_API_KEY" ]; then return; fi
  if [ -f "$LOKUM_RC" ]; then
    LOKUM_API_KEY=$(grep -E '^LOKUM_API_KEY=' "$LOKUM_RC" | cut -d= -f2)
    export LOKUM_API_KEY
  fi
}

# login: opens browser, starts local server, receives key
# logout: removes ~/.lokumrc
# push <file.md|skill-folder>: uploads markdown or a full Codex skill bundle
# list: lists all skills
# search <term>: searches skills
# install <slug>: downloads a .md file or reconstructs a Codex skill folder
# whoami: checks connection

# Kouti API (boxes — curated skill collections):
# GET    /api/koutis              — list your boxes
# GET    /api/koutis?slug=<slug>  — get box details
# POST   /api/koutis              — create/upsert box
#   body: { name, description?, visibility?, skillSlugs[] }
# DELETE /api/koutis?slug=<slug>  — delete box

# Full source: ${appUrl}/lokum.sh`}
        </pre>
      </details>
    </div>
  );
}

function CommandRow({ icon, name, desc, example }: { icon: React.ReactNode; name: string; desc: string; example: string }) {
  return (
    <div className="rounded-2xl bg-bg-elevated border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          {icon}
        </div>
        <div>
          <code className="font-mono text-sm font-semibold text-text-primary">{name}</code>
          <p className="text-xs text-text-muted mt-0.5">{desc}</p>
        </div>
      </div>
      <pre className="mt-3 rounded-xl bg-bg-base border border-border px-4 py-2.5 font-mono text-xs text-text-secondary select-all cursor-text whitespace-pre-wrap">
        {example}
      </pre>
    </div>
  );
}
