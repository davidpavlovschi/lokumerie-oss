import { z } from "zod";

export const sourceTypes = ["youtube", "twitter", "github", "billet", "other"] as const;
export type SourceType = (typeof sourceTypes)[number];

export const createSourceSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  url: z.string().url("URL invalide"),
  sourceType: z.enum(sourceTypes),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;

export function detectSourceType(url: string): SourceType {
  try {
    const u = new URL(url);
    if (
      u.hostname.includes("youtube.com") ||
      u.hostname.includes("youtu.be")
    )
      return "youtube";
    if (u.hostname.includes("twitter.com") || u.hostname.includes("x.com"))
      return "twitter";
    if (u.hostname.includes("github.com")) return "github";
    return "other";
  } catch {
    return "other";
  }
}
