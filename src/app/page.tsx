import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Github, Terminal } from "lucide-react";
import Image from "next/image";
import { CopyBlock } from "@/components/ui/CopyBlock";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/lokums");

  const t = await getTranslations("landing");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const hasGitHubAuth = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
  const hasGoogleAuth = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.04] blur-[150px]" />
        <div className="absolute bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-accent-secondary/[0.02] blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-6 md:py-10">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          {/* Mascot */}
          <div className="relative w-[45vw] max-w-[360px] aspect-square">
            <Image
              src="/icon.svg"
              alt="Lokumerie logo"
              fill
              className="object-contain drop-shadow-[0_0_80px_rgba(var(--accent-rgb),0.18)]"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-tight text-text-primary leading-[1.1]">
            Lokumerie
          </h1>
          <p className="mt-4 font-display text-lg md:text-2xl text-accent tracking-wide">
            {t("hero")}
          </p>
          <p className="mt-3 max-w-md text-sm text-text-muted leading-relaxed">
            {t("heroSub")}
          </p>

          {/* Auth buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            {hasGitHubAuth && (
              <form
                className="flex-1"
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/lokums" });
                }}
              >
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-bg-surface px-5 py-3.5 text-sm font-medium text-text-primary transition-all hover:border-border-hover hover:bg-bg-elevated hover:shadow-[0_4px_24px_rgba(var(--accent-rgb),0.06)]"
                >
                  <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
                  GitHub
                </button>
              </form>
            )}
            {hasGoogleAuth && (
              <form
                className="flex-1"
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/lokums" });
                }}
              >
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-bg-surface px-5 py-3.5 text-sm font-medium text-text-primary transition-all hover:border-border-hover hover:bg-bg-elevated hover:shadow-[0_4px_24px_rgba(var(--accent-rgb),0.06)]"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
              </form>
            )}
            {!hasGitHubAuth && !hasGoogleAuth && (
              <div className="rounded-2xl border border-border bg-bg-surface px-5 py-3.5 text-sm text-text-muted">
                Add a GitHub or Google OAuth app in `.env` to sign in.
              </div>
            )}
          </div>
        </div>

        {/* CLI section */}
        <div className="mt-24 md:mt-32">
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <Terminal className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">{t("cli")}</span>
          </div>
          <h2 className="mt-3 text-center font-display text-2xl md:text-3xl text-text-primary">
            {t("installTitle")}
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            {t("installDesc")}
          </p>

          <div className="mx-auto mt-8 max-w-xl space-y-3">
            {/* Step 1 */}
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">1</span>
                <span className="text-sm font-medium text-text-primary">{t("step1")}</span>
              </div>
              <CopyBlock text={`curl -sL ${appUrl}/lokum.sh -o ~/.local/bin/lokum && chmod +x ~/.local/bin/lokum`} />
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">2</span>
                <span className="text-sm font-medium text-text-primary">{t("step2")}</span>
              </div>
              <CopyBlock text="lokum login" />
              <p className="mt-2 text-xs text-text-muted">{t("step2Desc")}</p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/10 font-mono text-xs font-bold text-accent">3</span>
                <span className="text-sm font-medium text-text-primary">{t("step3")}</span>
              </div>
              <CopyBlock text="lokum list" />
            </div>
          </div>
        </div>

        {/* Commands grid */}
        <div className="mt-24 md:mt-32">
          <h2 className="text-center font-display text-2xl md:text-3xl text-text-primary">
            {t("allFromTerminal")}
          </h2>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3">
            <CommandCard name="push" desc={t("cmdPush")} example="lokum push skill.md | lokum push skill-folder/" />
            <CommandCard name="list" desc={t("cmdList")} example="lokum list" />
            <CommandCard name="search" desc={t("cmdSearch")} example='lokum search "deploy"' />
            <CommandCard name="install" desc={t("cmdInstall")} example="lokum install release-checklist" />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 flex flex-col items-center gap-3 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-bg-surface/50 px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-pistache/60 animate-pulse" />
            <span className="text-[11px] text-text-muted">{t("footer")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandCard({ name, desc, example }: { name: string; desc: string; example: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4 transition-colors hover:border-border-hover">
      <div className="flex items-baseline gap-2">
        <code className="font-mono text-sm font-semibold text-accent">{name}</code>
        <span className="text-xs text-text-muted">{desc}</span>
      </div>
      <CopyBlock text={example} />
    </div>
  );
}
