/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `PendingUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "targetEmail" TEXT;

-- AlterTable
ALTER TABLE "public"."Onboarding" ADD COLUMN     "address" TEXT,
ADD COLUMN     "coverImage" TEXT;

-- AlterTable
ALTER TABLE "public"."PendingUser" ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT;

-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "coverImage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PendingUser_emailVerificationToken_key" ON "public"."PendingUser"("emailVerificationToken");
