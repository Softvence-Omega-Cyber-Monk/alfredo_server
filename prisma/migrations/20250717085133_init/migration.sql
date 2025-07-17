-- CreateEnum
CREATE TYPE "IdentificationType" AS ENUM ('NID', 'PASSPORT', 'BIRTH_CERTIFICATE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'GREEK');

-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN     "aboutNeighborhood" TEXT,
ADD COLUMN     "availabilityEndDate" TIMESTAMP(3),
ADD COLUMN     "availabilityStartDate" TIMESTAMP(3),
ADD COLUMN     "homeDescription" TEXT,
ADD COLUMN     "homeImages" TEXT[],
ADD COLUMN     "homeName" TEXT,
ADD COLUMN     "isAvailableForExchange" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" TEXT,
ADD COLUMN     "city" TEXT[],
ADD COLUMN     "dateOfBirth" TEXT,
ADD COLUMN     "identification" "IdentificationType",
ADD COLUMN     "languagePreference" "Language",
ADD COLUMN     "paymentCardNumber" TEXT[];

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingAmenity" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "OnboardingAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "TransportOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTransport" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "transportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingTransport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurroundingType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "SurroundingType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingSurrounding" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "surroundingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingSurrounding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TransportOption_name_key" ON "TransportOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SurroundingType_name_key" ON "SurroundingType"("name");

-- AddForeignKey
ALTER TABLE "OnboardingAmenity" ADD CONSTRAINT "OnboardingAmenity_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingAmenity" ADD CONSTRAINT "OnboardingAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTransport" ADD CONSTRAINT "OnboardingTransport_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTransport" ADD CONSTRAINT "OnboardingTransport_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "TransportOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingSurrounding" ADD CONSTRAINT "OnboardingSurrounding_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingSurrounding" ADD CONSTRAINT "OnboardingSurrounding_surroundingId_fkey" FOREIGN KEY ("surroundingId") REFERENCES "SurroundingType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
