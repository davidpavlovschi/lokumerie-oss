-- CreateTable
CREATE TABLE "Kouti" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kouti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KoutiSkill" (
    "id" TEXT NOT NULL,
    "koutiId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KoutiSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentLink" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "linkType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kouti_slug_key" ON "Kouti"("slug");

-- CreateIndex
CREATE INDEX "KoutiSkill_koutiId_idx" ON "KoutiSkill"("koutiId");

-- CreateIndex
CREATE INDEX "KoutiSkill_skillId_idx" ON "KoutiSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "KoutiSkill_koutiId_skillId_key" ON "KoutiSkill"("koutiId", "skillId");

-- CreateIndex
CREATE INDEX "ContentLink_sourceType_sourceId_idx" ON "ContentLink"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "ContentLink_targetType_targetId_idx" ON "ContentLink"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentLink_sourceType_sourceId_targetType_targetId_linkTyp_key" ON "ContentLink"("sourceType", "sourceId", "targetType", "targetId", "linkType");

-- AddForeignKey
ALTER TABLE "Kouti" ADD CONSTRAINT "Kouti_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KoutiSkill" ADD CONSTRAINT "KoutiSkill_koutiId_fkey" FOREIGN KEY ("koutiId") REFERENCES "Kouti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KoutiSkill" ADD CONSTRAINT "KoutiSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
