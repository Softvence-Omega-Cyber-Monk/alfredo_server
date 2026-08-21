-- CreateEnum
CREATE TYPE "public"."ProtectPlanType" AS ENUM ('YEARLY', 'PER_TRIP');

-- CreateEnum
CREATE TYPE "public"."ProtectPurchaseStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ProtectPurchaseSource" AS ENUM ('LANDING', 'DASHBOARD');

-- CreateTable
CREATE TABLE "public"."ProtectPlan" (
    "id" TEXT NOT NULL,
    "type" "public"."ProtectPlanType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "priceId" TEXT NOT NULL DEFAULT '',
    "coverAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtectPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProtectPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "planId" TEXT NOT NULL,
    "planType" "public"."ProtectPlanType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "public"."ProtectPurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "tripsCovered" INTEGER NOT NULL DEFAULT 1,
    "propertyAddress" TEXT,
    "source" "public"."ProtectPurchaseSource" NOT NULL DEFAULT 'LANDING',
    "stripeSessionId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtectPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProtectPlan_type_key" ON "public"."ProtectPlan"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ProtectPurchase_stripeSessionId_key" ON "public"."ProtectPurchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "ProtectPurchase_userId_idx" ON "public"."ProtectPurchase"("userId");

-- CreateIndex
CREATE INDEX "ProtectPurchase_email_idx" ON "public"."ProtectPurchase"("email");

-- CreateIndex
CREATE INDEX "ProtectPurchase_status_idx" ON "public"."ProtectPurchase"("status");

-- AddForeignKey
ALTER TABLE "public"."ProtectPurchase" ADD CONSTRAINT "ProtectPurchase_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."ProtectPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProtectPurchase" ADD CONSTRAINT "ProtectPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
