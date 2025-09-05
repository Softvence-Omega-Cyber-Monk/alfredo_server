/*
  Warnings:

  - You are about to drop the column `achievementBadges` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BadgeType" AS ENUM ('REVIEW_BADGE', 'REGION_BADGE', 'SUSTAINABILITY_BADGE', 'SEASONAL_BADGE', 'EXCHANGE_BADGE', 'REFERRAL_BADGE', 'VERIFICATION_BADGE', 'LOYALTY_BADGE');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "achievementBadges";

-- CreateTable
CREATE TABLE "public"."Badge" (
    "id" TEXT NOT NULL,
    "type" "public"."BadgeType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserBadges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserBadges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_type_key" ON "public"."Badge"("type");

-- CreateIndex
CREATE INDEX "_UserBadges_B_index" ON "public"."_UserBadges"("B");

-- AddForeignKey
ALTER TABLE "public"."_UserBadges" ADD CONSTRAINT "_UserBadges_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserBadges" ADD CONSTRAINT "_UserBadges_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
