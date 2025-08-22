/*
  Warnings:

  - The `travelType` column on the `Onboarding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Onboarding" DROP COLUMN "travelType",
ADD COLUMN     "travelType" TEXT[];
