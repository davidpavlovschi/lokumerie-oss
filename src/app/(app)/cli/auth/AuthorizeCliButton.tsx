"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { authorizeCliSession } from "@/lib/actions/apikey";

export function AuthorizeCliButton({ port }: { port: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleAuthorize() {
    setStatus("loading");
    try {
      const key = await authorizeCliSession();
      // Redirect to the local CLI server
      window.location.href = `http://127.0.0.1:${port}/callback?key=${encodeURIComponent(key)}`;
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-pistache/10 border border-pistache/20 px-4 py-3 text-sm font-medium text-pistache">
        <Check className="h-4 w-4" />
        CLI autorise — vous pouvez fermer cet onglet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAuthorize}
        disabled={status === "loading"}
        className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-medium text-bg-base transition-all hover:bg-accent-hover disabled:opacity-50"
      >
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Autorisation...
          </span>
        ) : (
          "Autoriser"
        )}
      </button>
      {status === "error" && (
        <p className="text-xs text-accent-secondary">
          Erreur lors de l&apos;autorisation. Reessayez.
        </p>
      )}
    </div>
  );
}
