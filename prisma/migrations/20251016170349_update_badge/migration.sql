-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BadgeType" ADD VALUE 'PREMIUM_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'TOP_SUPPORTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'ONE_YEAR_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SUPPORTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'GOLDEN_HOST';
ALTER TYPE "public"."BadgeType" ADD VALUE 'VERIFIED';
ALTER TYPE "public"."BadgeType" ADD VALUE 'DUO';
ALTER TYPE "public"."BadgeType" ADD VALUE 'LOTS_OF_FRIENDS';
ALTER TYPE "public"."BadgeType" ADD VALUE 'PURE_CHARISMA';
ALTER TYPE "public"."BadgeType" ADD VALUE 'VIP';
ALTER TYPE "public"."BadgeType" ADD VALUE 'DIAMOND_VIP';
ALTER TYPE "public"."BadgeType" ADD VALUE 'THE_FIRST_TRADE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EXPERIENCED';
ALTER TYPE "public"."BadgeType" ADD VALUE 'VETERAN';
ALTER TYPE "public"."BadgeType" ADD VALUE 'PHILOXENIA';
ALTER TYPE "public"."BadgeType" ADD VALUE 'IT_MY_TOWN';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EMPIRE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EXPLORER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'AUTUMN_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'AUTUMN_EXPERT_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'WINTER_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'WINTER_EXPERT_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SPRING_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SPRING_EXPERT_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SUMMER_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SUMMER_EXPERT_TRAVELER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'ECO_CONSCIOUS_HOST';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EVERY_EURO_COUNTS';
ALTER TYPE "public"."BadgeType" ADD VALUE 'ATTICA';
ALTER TYPE "public"."BadgeType" ADD VALUE 'ATTICA_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CENTRAL_GREECE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CENTRAL_GREECE_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SPORADES';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SPORADES_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'THRACE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'THRACE_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'IONIAN';
ALTER TYPE "public"."BadgeType" ADD VALUE 'IONIAN_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SARONIC';
ALTER TYPE "public"."BadgeType" ADD VALUE 'SARONIC_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CRETE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CRETE_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EPIRUS';
ALTER TYPE "public"."BadgeType" ADD VALUE 'EPIRUS_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CYCLADES';
ALTER TYPE "public"."BadgeType" ADD VALUE 'CYCLADES_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'DODECANESE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'DODECANESE_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'GREECE_TROTTER';
ALTER TYPE "public"."BadgeType" ADD VALUE 'PELOPONNESE';
ALTER TYPE "public"."BadgeType" ADD VALUE 'PELOPONNESE_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'NORTH_AEGEAN';
ALTER TYPE "public"."BadgeType" ADD VALUE 'NORTH_AEGEAN_EXPERT';
ALTER TYPE "public"."BadgeType" ADD VALUE 'MACEDONIA';
ALTER TYPE "public"."BadgeType" ADD VALUE 'MACEDONIA_EXPERT';
