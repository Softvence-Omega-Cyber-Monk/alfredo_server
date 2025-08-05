/*
  Warnings:

  - You are about to drop the `TravelReason` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isTravelWithPets` to the `Onboarding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TravelReason" DROP CONSTRAINT "TravelReason_onboardingId_fkey";

-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "isTravelWithPets" BOOLEAN NOT NULL,
ADD COLUMN     "travelType" TEXT[];

-- DropTable
DROP TABLE "TravelReason";

-- DropEnum
DROP TYPE "TravelReasonType";
