/*
  Warnings:

  - You are about to drop the column `onboardingId` on the `Amenity` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingId` on the `SurroundingType` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingId` on the `TransportOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Amenity" DROP CONSTRAINT "Amenity_onboardingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurroundingType" DROP CONSTRAINT "SurroundingType_onboardingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TransportOption" DROP CONSTRAINT "TransportOption_onboardingId_fkey";

-- AlterTable
ALTER TABLE "public"."Amenity" DROP COLUMN "onboardingId";

-- AlterTable
ALTER TABLE "public"."SurroundingType" DROP COLUMN "onboardingId";

-- AlterTable
ALTER TABLE "public"."TransportOption" DROP COLUMN "onboardingId";

-- CreateTable
CREATE TABLE "public"."_OnboardingTransports" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OnboardingTransports_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_OnboardingSurroundings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OnboardingSurroundings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_OnboardingAmenities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OnboardingAmenities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OnboardingTransports_B_index" ON "public"."_OnboardingTransports"("B");

-- CreateIndex
CREATE INDEX "_OnboardingSurroundings_B_index" ON "public"."_OnboardingSurroundings"("B");

-- CreateIndex
CREATE INDEX "_OnboardingAmenities_B_index" ON "public"."_OnboardingAmenities"("B");

-- AddForeignKey
ALTER TABLE "public"."_OnboardingTransports" ADD CONSTRAINT "_OnboardingTransports_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnboardingTransports" ADD CONSTRAINT "_OnboardingTransports_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TransportOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnboardingSurroundings" ADD CONSTRAINT "_OnboardingSurroundings_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnboardingSurroundings" ADD CONSTRAINT "_OnboardingSurroundings_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SurroundingType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnboardingAmenities" ADD CONSTRAINT "_OnboardingAmenities_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnboardingAmenities" ADD CONSTRAINT "_OnboardingAmenities_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
