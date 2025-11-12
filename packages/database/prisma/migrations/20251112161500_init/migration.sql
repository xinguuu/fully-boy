-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('OX_QUIZ', 'BALANCE_GAME', 'INITIAL_QUIZ', 'FOUR_CHOICE_QUIZ', 'SPEED_QUIZ');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ICE_BREAKING', 'QUIZ', 'MUSIC', 'VOTE', 'ENTERTAINMENT', 'MEME');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'ORGANIZER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "gameType" "GameType" NOT NULL,
    "category" "Category" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER NOT NULL,
    "minPlayers" INTEGER NOT NULL DEFAULT 5,
    "maxPlayers" INTEGER NOT NULL DEFAULT 100,
    "needsMobile" BOOLEAN NOT NULL,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_results" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "leaderboard" JSONB NOT NULL,
    "questionStats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "games_gameType_isPublic_idx" ON "games"("gameType", "isPublic");

-- CreateIndex
CREATE INDEX "games_category_isPublic_idx" ON "games"("category", "isPublic");

-- CreateIndex
CREATE INDEX "games_userId_idx" ON "games"("userId");

-- CreateIndex
CREATE INDEX "questions_gameId_order_idx" ON "questions"("gameId", "order");

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_gameId_key" ON "favorites"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_pin_key" ON "rooms"("pin");

-- CreateIndex
CREATE INDEX "rooms_pin_idx" ON "rooms"("pin");

-- CreateIndex
CREATE INDEX "rooms_organizerId_idx" ON "rooms"("organizerId");

-- CreateIndex
CREATE INDEX "rooms_expiresAt_idx" ON "rooms"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "game_results_roomId_key" ON "game_results"("roomId");

-- CreateIndex
CREATE INDEX "game_results_roomId_idx" ON "game_results"("roomId");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
