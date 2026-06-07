"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative mt-3 group">
      <pre className="rounded-xl bg-bg-base border border-border px-4 py-3 pr-12 font-mono text-xs text-accent select-all whitespace-pre-wrap break-all">
        {text}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 rounded-lg border border-border bg-bg-surface p-1.5 text-text-muted transition-all hover:text-text-primary hover:border-border-hover opacity-0 group-hover:opacity-100"
        title="Copier"
      >
        {copied ? (
          <Check className="h-3 w-3 text-pistache" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
