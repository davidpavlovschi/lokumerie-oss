-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Skill table
ALTER TABLE "Skill" ADD COLUMN "embedding" vector(768);

-- Create index for cosine similarity search
CREATE INDEX "Skill_embedding_idx" ON "Skill" USING hnsw ("embedding" vector_cosine_ops);
