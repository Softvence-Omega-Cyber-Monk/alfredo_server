-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('SENT', 'READ');

-- AlterTable
ALTER TABLE "public"."ChatMessage" ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentType" TEXT,
ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "status" "public"."MessageStatus" NOT NULL DEFAULT 'SENT';

-- CreateTable
CREATE TABLE "public"."BlockedUser" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DeletedChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeletedChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockedUser_blockerId_blockedId_key" ON "public"."BlockedUser"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "DeletedChat_userId_partnerUserId_key" ON "public"."DeletedChat"("userId", "partnerUserId");

-- AddForeignKey
ALTER TABLE "public"."BlockedUser" ADD CONSTRAINT "BlockedUser_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlockedUser" ADD CONSTRAINT "BlockedUser_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeletedChat" ADD CONSTRAINT "DeletedChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
