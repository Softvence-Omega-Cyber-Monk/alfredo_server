/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `PendingUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."PendingUser" ADD COLUMN     "referralCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_referralCode_key" ON "public"."PendingUser"("referralCode");
