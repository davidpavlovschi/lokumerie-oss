import type { SkillVersion } from "@prisma/client";
import { Clock } from "lucide-react";

interface FourneeListProps {
  fournees: SkillVersion[];
  selectedIds?: string[];
  onSelect?: (id: string) => void;
}

export function FourneeList({
  fournees,
  selectedIds = [],
  onSelect,
}: FourneeListProps) {
  return (
    <div className="space-y-2">
      {fournees.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onSelect?.(f.id)}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
            selectedIds.includes(f.id)
              ? "border-accent bg-accent/10"
              : "border-border bg-bg-surface hover:border-border-hover"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 font-mono text-sm text-accent">
            v{f.version}
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-primary">
              {f.changelog || `Fournee #${f.version}`}
            </p>
            <p className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="h-3 w-3" />
              {new Date(f.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
