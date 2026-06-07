import { detectFlavor, isValidFlavor, type FlavorKey } from "./flavors";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function parseFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (kv) frontmatter[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { frontmatter, body: match[2] };
}

export interface ParsedSkill {
  name: string;
  description: string | undefined;
  flavor: FlavorKey;
  tags: string[];
}

export function parseSkillMarkdown(content: string): ParsedSkill {
  const { frontmatter, body } = parseFrontmatter(content);

  // --- Name: from frontmatter or first heading ---
  let name = frontmatter.name || "Sans nom";
  if (name === "Sans nom") {
    for (const line of body.split("\n")) {
      const headingMatch = line.match(/^#+\s+(.+)/);
      if (headingMatch) {
        name = headingMatch[1].trim();
        break;
      }
      const trimmed = line.trim();
      if (trimmed) {
        name = trimmed;
        break;
      }
    }
  }

  // --- Description: from frontmatter or first paragraph after heading ---
  let description: string | undefined = frontmatter.description?.slice(0, 1024);
  if (!description) {
    const lines = body.split("\n");
    let pastHeading = false;
    for (const line of lines) {
      if (line.match(/^#+\s/)) {
        pastHeading = true;
        continue;
      }
      if (pastHeading && line.trim()) {
        description = line.trim().slice(0, 200);
        break;
      }
    }
  }

  // --- Flavor: frontmatter override or auto-detect ---
  let flavor: FlavorKey;
  if (frontmatter.flavor && isValidFlavor(frontmatter.flavor)) {
    flavor = frontmatter.flavor;
  } else {
    flavor = detectFlavor(content);
  }

  // --- Tags: from description trigger phrases or TRIGGER line ---
  const tags: string[] = [];

  if (frontmatter.description) {
    const useWhen = frontmatter.description.match(
      /Use\s+when\s+(?:user\s+(?:says?|asks?|mentions?)\s+)?["']?(.+)/i
    );
    if (useWhen) {
      useWhen[1]
        .split(/[,;|]/)
        .map((t) =>
          t
            .trim()
            .toLowerCase()
            .replace(/["`'.]/g, "")
            .replace(/^or\s+/, "")
        )
        .filter((t) => t.length > 1 && t.length < 30)
        .slice(0, 6)
        .forEach((t) => tags.push(t));
    }
  }

  if (tags.length === 0) {
    const triggerMatch = content.match(/TRIGGER\s+when[:\s]*(.+)/i);
    if (triggerMatch) {
      triggerMatch[1]
        .split(/[,;|]/)
        .map((t) => t.trim().toLowerCase().replace(/["`']/g, ""))
        .filter((t) => t.length > 1 && t.length < 30)
        .slice(0, 6)
        .forEach((t) => tags.push(t));
    }
  }

  return { name, description, flavor, tags };
}
