-- AlterTable
ALTER TABLE "public"."Amenity" ADD COLUMN     "greek_name" TEXT;

-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "is_populer" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."SurroundingType" ADD COLUMN     "greek_name" TEXT;

-- AlterTable
ALTER TABLE "public"."TransportOption" ADD COLUMN     "greek_name" TEXT;
