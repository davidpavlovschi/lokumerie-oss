"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyKoutiInstall({ slugs }: { slugs: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const commands = slugs.map((s) => `lokum install ${s}`).join("\n");
    await navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-border-hover hover:text-text-primary"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-pistache" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy all
        </>
      )}
    </button>
  );
}
