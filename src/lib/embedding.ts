import { GoogleGenAI } from "@google/genai";

function getGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

/**
 * Combine skill fields into a single embeddable text string.
 */
export function buildEmbeddableText(skill: {
  name: string;
  description?: string | null;
  tags?: string[];
}): string {
  const parts = [skill.name];
  if (skill.description) parts.push(skill.description);
  if (skill.tags?.length) parts.push(skill.tags.join(", "));
  return parts.join(" — ");
}

/**
 * Generate a 768-dim embedding vector using Gemini Embedding 2.
 */
export async function embedText(text: string): Promise<number[]> {
  const genai = getGenAI();
  const result = await genai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  return result.embeddings![0].values!;
}
