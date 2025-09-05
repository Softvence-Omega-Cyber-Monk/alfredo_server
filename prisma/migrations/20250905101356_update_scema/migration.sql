-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "totalExchange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalListed" INTEGER NOT NULL DEFAULT 0;
