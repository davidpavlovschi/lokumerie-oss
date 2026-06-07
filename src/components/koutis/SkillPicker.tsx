"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, GripVertical } from "lucide-react";
import { FlavorBadge } from "@/components/ui/FlavorBadge";
import { formatSkillName } from "@/lib/format-skill";

interface SkillOption {
  id: string;
  name: string;
  slug: string;
  flavor: string;
}

interface SkillPickerProps {
  selected: SkillOption[];
  onChange: (skills: SkillOption[]) => void;
}

export function SkillPicker({ selected, onChange }: SkillPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const add = (skill: SkillOption) => {
    if (!selected.find((s) => s.id === skill.id)) {
      onChange([...selected, skill]);
    }
    setQuery("");
    setResults([]);
  };

  const remove = (id: string) => {
    onChange(selected.filter((s) => s.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newOrder = [...selected];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, moved);
    onChange(newOrder);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const filtered = results.filter((r) => !selected.find((s) => s.id === r.id));

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills to add..."
          className="w-full rounded-xl border border-border bg-bg-base pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-colors focus:border-accent/40"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        )}
      </div>

      {/* Search results dropdown */}
      {filtered.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
          {filtered.map((skill) => (
            <button
              key={skill.id}
              onClick={() => add(skill)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-overlay"
            >
              <span className="text-sm text-text-primary">{formatSkillName(skill.name)}</span>
              <FlavorBadge flavor={skill.flavor} />
            </button>
          ))}
        </div>
      )}

      {/* Selected skills - draggable */}
      {selected.length > 0 && (
        <div className="space-y-1">
          {selected.map((skill, i) => (
            <div
              key={skill.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2 transition-all ${
                dragIndex === i ? "opacity-50" : ""
              }`}
            >
              <GripVertical className="h-3.5 w-3.5 text-text-muted cursor-grab shrink-0" />
              <span className="flex-1 text-sm text-text-primary">{formatSkillName(skill.name)}</span>
              <FlavorBadge flavor={skill.flavor} />
              <button
                onClick={() => remove(skill.id)}
                className="rounded-lg p-1 text-text-muted hover:text-accent-secondary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name="skillIds" value={selected.map((s) => s.id).join(",")} />
    </div>
  );
}
