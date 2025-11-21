-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('QUIZ', 'PARTY');

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "gameCategory" "TemplateCategory" NOT NULL DEFAULT 'QUIZ',
ADD COLUMN     "sessionSettings" JSONB;

-- CreateIndex
CREATE INDEX "games_gameCategory_isPublic_idx" ON "games"("gameCategory", "isPublic");
