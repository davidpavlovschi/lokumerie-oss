"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Flame } from "lucide-react";
import { enfourner } from "@/lib/actions/lokums";

export function SkillDropZone() {
  const [content, setContent] = useState("");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text");
    if (text && text.length > 20) {
      setContent(text);
      setFileName(null);
    }
  }

  const firstHeading = content.match(/^#+\s+(.+)/m)?.[1] || "";

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!content ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 transition-all duration-300 ${
            dragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-border hover:border-border-hover hover:bg-bg-surface/50"
          }`}
        >
          <Upload
            className={`mb-4 h-10 w-10 transition-colors ${
              dragging ? "text-accent" : "text-text-secondary/40"
            }`}
          />
          <p className="text-sm text-text-primary">
            Glissez un fichier .md ici
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            ou cliquez pour parcourir, ou collez directement (Ctrl+V)
          </p>
          <p className="mt-3 text-[11px] text-text-muted">
            Pour un vrai dossier Codex complet, utilisez `lokum push release-checklist/`.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.txt,.markdown"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <>
          {/* Preview */}
          <div className="rounded-2xl border border-border bg-bg-surface p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {firstHeading || fileName || "Skill"}
                </p>
                <p className="text-xs text-text-secondary">
                  {content.split("\n").length} lignes &middot;{" "}
                  {(content.length / 1024).toFixed(1)} Ko
                </p>
              </div>
            </div>
            <pre className="max-h-64 overflow-auto rounded-xl bg-bg-elevated p-4 font-mono text-xs text-text-secondary">
              {content.slice(0, 2000)}
              {content.length > 2000 && "\n..."}
            </pre>
          </div>

          {/* Submit */}
          <form action={enfourner}>
            <input type="hidden" name="content" value={content} />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-bg-base transition-colors hover:bg-accent/90"
              >
                <Flame className="h-4 w-4" />
                Enfourner
              </button>
              <button
                type="button"
                onClick={() => {
                  setContent("");
                  setFileName(null);
                }}
                className="rounded-xl border border-border px-4 py-3 text-sm text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
              >
                Recommencer
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
