"use client";

import { useState } from "react";
import { FourneeDiff } from "@/components/lokums/FourneeDiff";
import { LokumPreview } from "@/components/lokums/LokumPreview";
import { Clock, GitCompareArrows } from "lucide-react";

interface Fournee {
  id: string;
  version: number;
  content: string;
  changelog: string | null;
  createdAt: string;
}

interface FourneesClientProps {
  fournees: Fournee[];
}

export function FourneesClient({ fournees }: FourneesClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setViewingId(null);
  }

  const selectedFournees = selected
    .map((id) => fournees.find((f) => f.id === id)!)
    .filter(Boolean)
    .sort((a, b) => a.version - b.version);

  const viewingFournee = fournees.find((f) => f.id === viewingId);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-2">
        <p className="mb-3 text-xs text-text-secondary">
          Cliquez pour voir, selectionnez 2 pour comparer
        </p>
        {fournees.map((f) => (
          <div key={f.id} className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setViewingId(f.id === viewingId ? null : f.id);
                setSelected([]);
              }}
              className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                viewingId === f.id
                  ? "border-accent bg-accent/10"
                  : "border-border bg-bg-surface hover:border-border-hover"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 font-mono text-sm text-accent">
                v{f.version}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-text-primary">
                  {f.changelog || `Fournee #${f.version}`}
                </p>
                <p className="flex items-center gap-1 text-xs text-text-secondary">
                  <Clock className="h-3 w-3" />
                  {new Date(f.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => toggleSelect(f.id)}
              className={`flex items-center justify-center rounded-xl border px-2 transition-all ${
                selected.includes(f.id)
                  ? "border-citron bg-citron/10 text-citron"
                  : "border-border text-text-secondary hover:border-border-hover"
              }`}
              title="Selectionner pour comparer"
            >
              <GitCompareArrows className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div>
        {selectedFournees.length === 2 ? (
          <FourneeDiff
            oldContent={selectedFournees[0].content}
            newContent={selectedFournees[1].content}
            oldVersion={selectedFournees[0].version}
            newVersion={selectedFournees[1].version}
          />
        ) : viewingFournee ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="font-mono text-sm text-accent">
                v{viewingFournee.version}
              </span>
              {viewingFournee.changelog && (
                <span className="text-sm text-text-secondary">
                  - {viewingFournee.changelog}
                </span>
              )}
            </div>
            <LokumPreview content={viewingFournee.content} />
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border">
            <p className="text-sm text-text-secondary">
              Selectionnez une fournee pour la visualiser, ou deux pour comparer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
