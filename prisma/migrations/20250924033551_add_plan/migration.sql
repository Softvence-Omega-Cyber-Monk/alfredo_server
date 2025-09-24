/*
  Warnings:

  - You are about to drop the column `description` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `plan_duration` on the `Plan` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Plan_name_key";

-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "description",
DROP COLUMN "features",
DROP COLUMN "name",
DROP COLUMN "planType",
DROP COLUMN "plan_duration";

-- CreateTable
CREATE TABLE "public"."PlanTranslation" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "features" TEXT[],
    "planDuration" TEXT,
    "planType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanTranslation_planId_language_key" ON "public"."PlanTranslation"("planId", "language");

-- AddForeignKey
ALTER TABLE "public"."PlanTranslation" ADD CONSTRAINT "PlanTranslation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
