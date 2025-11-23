-- AlterTable
ALTER TABLE "games" ADD COLUMN     "sourceGameId" TEXT;

-- CreateIndex
CREATE INDEX "games_sourceGameId_idx" ON "games"("sourceGameId");
