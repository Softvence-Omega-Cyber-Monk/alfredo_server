/*
  Warnings:

  - You are about to drop the `OnboardingAmenity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OnboardingSurrounding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OnboardingTransport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OnboardingAmenity" DROP CONSTRAINT "OnboardingAmenity_amenityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingAmenity" DROP CONSTRAINT "OnboardingAmenity_onboardingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingSurrounding" DROP CONSTRAINT "OnboardingSurrounding_onboardingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingSurrounding" DROP CONSTRAINT "OnboardingSurrounding_surroundingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingTransport" DROP CONSTRAINT "OnboardingTransport_onboardingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OnboardingTransport" DROP CONSTRAINT "OnboardingTransport_transportId_fkey";

-- DropIndex
DROP INDEX "public"."Amenity_name_key";

-- DropIndex
DROP INDEX "public"."SurroundingType_name_key";

-- DropIndex
DROP INDEX "public"."TransportOption_name_key";

-- AlterTable
ALTER TABLE "public"."Amenity" ADD COLUMN     "onboardingId" TEXT;

-- AlterTable
ALTER TABLE "public"."SurroundingType" ADD COLUMN     "onboardingId" TEXT;

-- AlterTable
ALTER TABLE "public"."TransportOption" ADD COLUMN     "onboardingId" TEXT;

-- DropTable
DROP TABLE "public"."OnboardingAmenity";

-- DropTable
DROP TABLE "public"."OnboardingSurrounding";

-- DropTable
DROP TABLE "public"."OnboardingTransport";

-- AddForeignKey
ALTER TABLE "public"."Amenity" ADD CONSTRAINT "Amenity_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportOption" ADD CONSTRAINT "TransportOption_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurroundingType" ADD CONSTRAINT "SurroundingType_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;
