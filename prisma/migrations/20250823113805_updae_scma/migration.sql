/*
  Warnings:

  - Changed the type of `favoriteDestinations` on the `Onboarding` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Onboarding" DROP COLUMN "favoriteDestinations",
ADD COLUMN     "favoriteDestinations" TEXT NOT NULL;
