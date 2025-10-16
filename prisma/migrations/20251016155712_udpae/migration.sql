-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "stripeSubscriptionId" TEXT;
