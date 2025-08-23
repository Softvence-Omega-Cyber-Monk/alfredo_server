/*
  Warnings:

  - Added the required column `ageRange` to the `Onboarding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Onboarding" DROP COLUMN "ageRange",
ADD COLUMN     "ageRange" TEXT NOT NULL;
