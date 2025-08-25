/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Payment_transactionId_key";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "transactionId";
