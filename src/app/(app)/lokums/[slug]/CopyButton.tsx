"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-4 py-2.5 text-sm font-medium text-accent transition-all hover:bg-accent/15 hover:border-accent/30"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-pistache" />
          <span className="text-pistache">Copie !</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copier
        </>
      )}
    </button>
  );
}
