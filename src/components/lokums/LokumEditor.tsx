"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface LokumEditorProps {
  defaultValue?: string;
  name: string;
}

function turndownSimple(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n");
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

export function LokumEditor({ defaultValue = "", name }: LokumEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("lokumEditor");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("placeholder"),
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] px-6 py-4 outline-none text-text-primary",
      },
    },
    onUpdate: ({ editor }) => {
      if (hiddenRef.current) {
        hiddenRef.current.value = turndownSimple(editor.getHTML());
      }
    },
  });

  const ToolbarButton = useCallback(
    ({
      onClick,
      active,
      children,
    }: {
      onClick: () => void;
      active?: boolean;
      children: React.ReactNode;
    }) => (
      <button
        type="button"
        onClick={onClick}
        className={`rounded-lg p-1.5 transition-colors ${
          active
            ? "bg-accent/20 text-accent"
            : "text-text-secondary hover:bg-overlay-strong hover:text-text-primary"
        }`}
      >
        {children}
      </button>
    ),
    []
  );

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated overflow-hidden">
      <input type="hidden" ref={hiddenRef} name={name} defaultValue={defaultValue} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-3 py-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
