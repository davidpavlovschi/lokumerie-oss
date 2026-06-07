"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

interface TagInputProps {
  name: string;
  defaultValue?: string[];
}

export function TagInput({ name, defaultValue = [] }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [input, setInput] = useState("");
  const t = useTranslations("common");

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={tags.join(",")} />
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-2 focus-within:border-border-hover">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-0.5 text-xs text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-accent-secondary"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? t("addIngredients") : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 outline-none"
        />
      </div>
    </div>
  );
}
