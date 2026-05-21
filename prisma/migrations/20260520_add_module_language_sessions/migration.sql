-- CreateTable
CREATE TABLE "ModuleLanguageSession" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleLanguageSession_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add languageSessionId to ModuleVideo
ALTER TABLE "ModuleVideo" ADD COLUMN "languageSessionId" INTEGER;

-- AlterTable: Add languageSessionId to ModuleDocument
ALTER TABLE "ModuleDocument" ADD COLUMN "languageSessionId" INTEGER;

-- AlterTable: Add languageSessionId to Quiz
ALTER TABLE "Quiz" ADD COLUMN "languageSessionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ModuleLanguageSession_moduleId_locale_key" ON "ModuleLanguageSession"("moduleId", "locale");

-- AddForeignKey
ALTER TABLE "ModuleLanguageSession" ADD CONSTRAINT "ModuleLanguageSession_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TrainingModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleVideo" ADD CONSTRAINT "ModuleVideo_languageSessionId_fkey" FOREIGN KEY ("languageSessionId") REFERENCES "ModuleLanguageSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleDocument" ADD CONSTRAINT "ModuleDocument_languageSessionId_fkey" FOREIGN KEY ("languageSessionId") REFERENCES "ModuleLanguageSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_languageSessionId_fkey" FOREIGN KEY ("languageSessionId") REFERENCES "ModuleLanguageSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
