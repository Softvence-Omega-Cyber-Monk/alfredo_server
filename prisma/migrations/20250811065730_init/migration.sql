/*
  Warnings:

  - You are about to drop the `FavoriteDestination` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteDestination" DROP CONSTRAINT "FavoriteDestination_onboardingId_fkey";

-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "favoriteDestinations" "DestinationType"[];

-- DropTable
DROP TABLE "FavoriteDestination";
