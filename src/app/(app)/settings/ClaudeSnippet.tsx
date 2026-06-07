"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

function buildSnippet(apiKey: string, appUrl: string) {
  return `Install the Lokum CLI for Lokumerie, a self-hosted private package registry for team AI know-how. Run this single command:

curl -sL ${appUrl}/lokum.sh | LOKUM_API_KEY=${apiKey} bash -s -- setup

Then verify it works by running "lokum list" and show me the output so I know it's connected.

The CLI supports: push (upload .md skills or full Codex skill folders with SKILL.md, scripts/, assets/, agents/), list, search, install (download .md skills or reconstruct Codex skill folders), versions, login, logout, whoami.

Koutis (boxes) — curated skill collections via the API:
  GET  /api/koutis                      — list your boxes
  GET  /api/koutis?slug=<slug>          — get a box by slug
  POST /api/koutis                      — create/upsert a box (JSON: name, description, visibility, skillSlugs[])
  DELETE /api/koutis?slug=<slug>        — delete a box
  GET  /api/koutis/install?slug=<slug>  — bulk download all skills in a box (returns name, content, metadata for each)
All kouti endpoints use Bearer token auth (same API key).`;
}

export function ClaudeSnippet({ apiKey, appUrl }: { apiKey: string; appUrl: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = buildSnippet(apiKey, appUrl);

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3 relative group">
      <pre className="rounded-2xl bg-bg-base border border-accent/10 p-4 pr-12 font-mono text-[11px] leading-relaxed text-text-secondary max-h-[200px] overflow-y-auto whitespace-pre-wrap">
        {snippet}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 rounded-xl border border-border bg-bg-surface p-2 text-text-muted transition-all hover:text-text-primary hover:border-accent/30 hover:bg-bg-elevated"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-pistache" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
