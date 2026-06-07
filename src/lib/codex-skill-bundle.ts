export type SkillBundleEncoding = "utf-8" | "base64";

export interface SkillBundleFile {
  path: string;
  content: string;
  encoding: SkillBundleEncoding;
  mode?: number;
  size?: number;
}

export interface CodexSkillBundle {
  format: "codex-skill";
  root?: string;
  entrypoint: "SKILL.md";
  files: SkillBundleFile[];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeRelativePath(path: string): boolean {
  if (!path || path.startsWith("/") || path.includes("\0")) return false;
  const parts = path.split("/");
  return parts.every((part) => part && part !== "." && part !== "..");
}

function normalizeMode(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) return undefined;
  if (value < 0 || value > 0o777) return undefined;
  return value;
}

export function validateCodexSkillBundle(value: unknown): CodexSkillBundle | null {
  if (!isRecord(value)) return null;
  if (value.format !== "codex-skill") return null;
  if (value.entrypoint !== "SKILL.md") return null;
  if (!Array.isArray(value.files)) return null;

  const files: SkillBundleFile[] = [];
  for (const rawFile of value.files) {
    if (!isRecord(rawFile)) return null;
    if (typeof rawFile.path !== "string" || !isSafeRelativePath(rawFile.path)) return null;
    if (rawFile.encoding !== "utf-8" && rawFile.encoding !== "base64") return null;
    if (typeof rawFile.content !== "string") return null;

    files.push({
      path: rawFile.path,
      content: rawFile.content,
      encoding: rawFile.encoding,
      mode: normalizeMode(rawFile.mode),
      size: typeof rawFile.size === "number" && rawFile.size >= 0 ? rawFile.size : undefined,
    });
  }

  if (!files.some((file) => file.path === "SKILL.md" && file.encoding === "utf-8")) {
    return null;
  }

  return {
    format: "codex-skill",
    root: typeof value.root === "string" ? value.root : undefined,
    entrypoint: "SKILL.md",
    files,
  };
}

export function getSkillMdFromBundle(bundle: CodexSkillBundle): string | null {
  const skillFile = bundle.files.find((file) => file.path === "SKILL.md");
  if (!skillFile || skillFile.encoding !== "utf-8") return null;
  return skillFile.content;
}
