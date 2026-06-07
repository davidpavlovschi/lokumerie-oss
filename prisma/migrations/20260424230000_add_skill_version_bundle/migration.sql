-- Store optional multi-file Codex skill bundles alongside the markdown entrypoint.
ALTER TABLE "SkillVersion" ADD COLUMN "bundle" JSONB;
