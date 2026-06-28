-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'admin', 'user');

-- CreateEnum
CREATE TYPE "LocationCategory" AS ENUM ('wisata_budaya', 'wisata_kuliner', 'wisata_sejarah', 'ekowisata', 'umkm', 'hidden_spot');

-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('main', 'side', 'cultural', 'historical', 'culinary', 'umkm_quest', 'eco', 'photo', 'ar_treasure', 'social', 'educational', 'daily', 'seasonal');

-- CreateEnum
CREATE TYPE "QuestDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "ObjectiveType" AS ENUM ('visit_location', 'scan_qr', 'answer_quiz', 'take_photo', 'buy_product', 'write_review', 'eco_action', 'social_interact');

-- CreateEnum
CREATE TYPE "StoryCategory" AS ENUM ('budaya', 'sejarah', 'legenda', 'kuliner', 'lingkungan');

-- CreateEnum
CREATE TYPE "BattleType" AS ENUM ('knowledge', 'eco', 'culinary', 'heritage', 'umkm_battle', 'puzzle', 'social');

-- CreateEnum
CREATE TYPE "UmkmCategory" AS ENUM ('kuliner', 'suvenir', 'kerajinan', 'fashion', 'jasa');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "currentXp" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 100,
    "language" TEXT NOT NULL DEFAULT 'id',
    "completedQuestIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activeQuestIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "obtainedBadgeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "obtainedRewardIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unlockedStoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "descId" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "category" "LocationCategory" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "addressId" TEXT,
    "addressEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descId" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "type" "QuestType" NOT NULL,
    "difficulty" "QuestDifficulty" NOT NULL DEFAULT 'easy',
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "availableLevels" INTEGER[] DEFAULT ARRAY[1]::INTEGER[],
    "estimatedTimeId" TEXT,
    "estimatedTimeEn" TEXT,
    "imageUrl" TEXT,
    "locationId" TEXT NOT NULL,
    "relatedUmkmId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestObjective" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "descId" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "type" "ObjectiveType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestReward" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "badgeId" TEXT,
    "voucherId" TEXT,
    "collectibleId" TEXT,
    "storyUnlockId" TEXT,

    CONSTRAINT "QuestReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "category" "StoryCategory" NOT NULL,
    "imageUrl" TEXT,
    "locationId" TEXT NOT NULL,
    "unlockedByQuestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "type" "BattleType" NOT NULL,
    "descId" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 60,
    "rewardXp" INTEGER NOT NULL DEFAULT 0,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "passingScore" INTEGER NOT NULL DEFAULT 60,
    "questId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleQuestion" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanationId" TEXT NOT NULL,
    "explanationEn" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BattleQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Umkm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descId" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "category" "UmkmCategory" NOT NULL,
    "products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voucherAvailable" BOOLEAN NOT NULL DEFAULT false,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Umkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestReward_questId_key" ON "QuestReward"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_questId_key" ON "Battle"("questId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestObjective" ADD CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestReward" ADD CONSTRAINT "QuestReward_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleQuestion" ADD CONSTRAINT "BattleQuestion_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
