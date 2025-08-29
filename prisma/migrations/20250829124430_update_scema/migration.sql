/*
  Warnings:

  - You are about to drop the column `hasOnBoarded` on the `Onboarding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Onboarding" DROP COLUMN "hasOnBoarded";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "hasOnboarded" BOOLEAN NOT NULL DEFAULT false;
