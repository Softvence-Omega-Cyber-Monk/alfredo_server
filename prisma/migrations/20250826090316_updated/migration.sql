-- DropForeignKey
ALTER TABLE "public"."ExchangeRequest" DROP CONSTRAINT "ExchangeRequest_fromPropertyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ExchangeRequest" DROP CONSTRAINT "ExchangeRequest_toPropertyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_fromPropertyId_fkey" FOREIGN KEY ("fromPropertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_toPropertyId_fkey" FOREIGN KEY ("toPropertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
