-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('AGE_18_30', 'AGE_30_50', 'AGE_50_65', 'AGE_65_PLUS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('WORKER', 'RETIRED', 'STUDENT', 'UNEMPLOYED');

-- CreateEnum
CREATE TYPE "TravelGroup" AS ENUM ('BY_MYSELF', 'FAMILY', 'COUPLE', 'FRIENDS');

-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('BIG_CITIES', 'SMALL_CITIES', 'SEASIDE', 'MOUNTAIN');

-- CreateEnum
CREATE TYPE "TravelReasonType" AS ENUM ('RELAX', 'ADVENTURE', 'WORK');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOME', 'APARTMENT');

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "homeAddress" TEXT,
    "destination" TEXT,
    "ageRange" "AgeRange",
    "gender" "Gender",
    "employmentStatus" "EmploymentStatus",
    "travelMostlyWith" "TravelGroup",
    "notes" TEXT,
    "propertyType" "PropertyType",
    "isMainResidence" BOOLEAN,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteDestination" (
    "id" TEXT NOT NULL,
    "type" "DestinationType" NOT NULL,
    "onboardingId" TEXT NOT NULL,

    CONSTRAINT "FavoriteDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravelReason" (
    "id" TEXT NOT NULL,
    "reason" "TravelReasonType" NOT NULL,
    "onboardingId" TEXT NOT NULL,

    CONSTRAINT "TravelReason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding"("userId");

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteDestination" ADD CONSTRAINT "FavoriteDestination_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravelReason" ADD CONSTRAINT "TravelReason_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
