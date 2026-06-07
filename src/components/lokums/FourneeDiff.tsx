"use client";

import { diffLines, type Change } from "diff";

interface FourneeDiffProps {
  oldContent: string;
  newContent: string;
  oldVersion: number;
  newVersion: number;
}

export function FourneeDiff({
  oldContent,
  newContent,
  oldVersion,
  newVersion,
}: FourneeDiffProps) {
  const changes: Change[] = diffLines(oldContent, newContent);

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="rounded-md bg-accent-secondary/20 px-2 py-0.5 text-xs text-accent-secondary">
          v{oldVersion}
        </span>
        <span className="text-xs text-text-secondary">vs</span>
        <span className="rounded-md bg-pistache/20 px-2 py-0.5 text-xs text-pistache">
          v{newVersion}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm">
        {changes.map((change, i) => {
          const lines = change.value.split("\n").filter((l, idx, arr) =>
            idx < arr.length - 1 || l !== ""
          );
          return lines.map((line, j) => (
            <div
              key={`${i}-${j}`}
              className={`px-3 py-0.5 ${
                change.added
                  ? "bg-pistache/10 text-pistache"
                  : change.removed
                    ? "bg-accent-secondary/10 text-accent-secondary line-through"
                    : "text-text-secondary"
              }`}
            >
              <span className="mr-3 inline-block w-4 select-none text-text-secondary/40">
                {change.added ? "+" : change.removed ? "-" : " "}
              </span>
              {line}
            </div>
          ));
        })}
      </pre>
    </div>
  );
}
