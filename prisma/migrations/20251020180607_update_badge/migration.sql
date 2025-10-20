-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_planId_fkey";

-- AlterTable
ALTER TABLE "public"."Badge" ADD COLUMN     "greek_discription" TEXT,
ADD COLUMN     "greek_displayName" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
