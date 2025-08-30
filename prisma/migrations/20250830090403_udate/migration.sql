/*
  Warnings:

  - You are about to drop the column `isActive` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "priceId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "isActive",
DROP COLUMN "priceId";
