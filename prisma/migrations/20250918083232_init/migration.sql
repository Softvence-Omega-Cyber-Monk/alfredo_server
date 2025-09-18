/*
  Warnings:

  - Added the required column `plan_duration` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PropertyType" ADD VALUE 'ROOM';
ALTER TYPE "public"."PropertyType" ADD VALUE 'BOAT';
ALTER TYPE "public"."PropertyType" ADD VALUE 'VAN';

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "plan_duration" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Web_subscribe" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Web_subscribe_pkey" PRIMARY KEY ("id")
);
