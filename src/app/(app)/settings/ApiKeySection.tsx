"use client";

import { useState } from "react";
import { Key, Copy, Check, Trash2 } from "lucide-react";
import { generateApiKey, revokeApiKey } from "@/lib/actions/apikey";

export function ApiKeySection({ hasKey }: { hasKey: boolean }) {
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const key = await generateApiKey();
    setNewKey(key);
  }

  async function handleCopy() {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-bg-surface p-5">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-medium text-text-primary">Clé API</h2>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Pour pousser des skills depuis le terminal
      </p>

      {newKey ? (
        <div className="mt-4">
          <p className="text-xs text-accent-secondary mb-2">
            Copiez cette clé maintenant, elle ne sera plus affichée.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-2xl bg-bg-elevated px-4 py-2.5 font-mono text-xs text-accent break-all">
              {newKey}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-2xl border border-border p-2.5 text-text-secondary hover:text-text-primary transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-pistache" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium text-bg-base transition-colors hover:bg-accent/90"
          >
            {hasKey ? "Régénérer" : "Générer une clé"}
          </button>
          {hasKey && (
            <form action={revokeApiKey}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm text-text-secondary hover:border-accent-secondary/30 hover:text-accent-secondary transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Revoquer
              </button>
            </form>
          )}
          {hasKey && (
            <span className="text-xs text-pistache">Clé active</span>
          )}
        </div>
      )}
    </div>
  );
}
