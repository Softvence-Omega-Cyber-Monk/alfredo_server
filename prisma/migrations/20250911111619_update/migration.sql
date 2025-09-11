/*
  Warnings:

  - The values [MONTHLY] on the enum `PlanType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PlanType_new" AS ENUM ('YEARLY', 'TWO_YEARLY');
ALTER TABLE "public"."Plan" ALTER COLUMN "planType" TYPE "public"."PlanType_new" USING ("planType"::text::"public"."PlanType_new");
ALTER TYPE "public"."PlanType" RENAME TO "PlanType_old";
ALTER TYPE "public"."PlanType_new" RENAME TO "PlanType";
DROP TYPE "public"."PlanType_old";
COMMIT;
