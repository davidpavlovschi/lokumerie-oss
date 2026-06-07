import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";

const prisma = new PrismaClient();
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

function buildEmbeddableText(skill: {
  name: string;
  description: string | null;
  tags: string[];
}): string {
  const parts = [skill.name];
  if (skill.description) parts.push(skill.description);
  if (skill.tags.length) parts.push(skill.tags.join(", "));
  return parts.join(" — ");
}

async function embedText(text: string): Promise<number[]> {
  const result = await genai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });
  return result.embeddings![0].values!;
}

async function main() {
  // Find skills without embeddings
  const skills = await prisma.$queryRawUnsafe<
    { id: string; name: string; description: string | null; tags: string[] }[]
  >(`SELECT "id", "name", "description", "tags" FROM "Skill" WHERE "embedding" IS NULL`);

  console.log(`Found ${skills.length} skills without embeddings`);

  for (const skill of skills) {
    const text = buildEmbeddableText(skill);
    try {
      const embedding = await embedText(text);
      const vectorStr = `[${embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "Skill" SET "embedding" = $1::vector WHERE "id" = $2`,
        vectorStr,
        skill.id
      );
      console.log(`  Embedded: ${skill.name}`);
    } catch (e) {
      console.error(`  Failed: ${skill.name}`, e);
    }
    // Rate limit: small delay between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("Done");
  await prisma.$disconnect();
}

main().catch(console.error);
