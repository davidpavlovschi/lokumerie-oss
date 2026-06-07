/**
 * Format a kebab-case skill name to Title Case.
 * "bug-fix-loop" → "Bug Fix Loop"
 * Already spaced names pass through unchanged.
 */
export function formatSkillName(name: string): string {
  if (name.includes(" ")) return name;
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extract the core description without "Use when..." trigger phrases.
 * "Systematic bug fix workflow. Use when user pastes error..." → "Systematic bug fix workflow."
 */
export function cleanDescription(description: string | null | undefined): string | undefined {
  if (!description) return undefined;
  const cut = description.replace(/\.?\s*Use\s+when\b[\s\S]*$/i, "");
  return cut.trim() || description;
}
