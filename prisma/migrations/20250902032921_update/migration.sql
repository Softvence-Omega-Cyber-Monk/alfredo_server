-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "city" SET DEFAULT '';

-- CreateTable
CREATE TABLE "public"."_PropertyAmenities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PropertyAmenities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_PropertyTransports" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PropertyTransports_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_PropertySurroundings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PropertySurroundings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PropertyAmenities_B_index" ON "public"."_PropertyAmenities"("B");

-- CreateIndex
CREATE INDEX "_PropertyTransports_B_index" ON "public"."_PropertyTransports"("B");

-- CreateIndex
CREATE INDEX "_PropertySurroundings_B_index" ON "public"."_PropertySurroundings"("B");

-- AddForeignKey
ALTER TABLE "public"."_PropertyAmenities" ADD CONSTRAINT "_PropertyAmenities_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PropertyAmenities" ADD CONSTRAINT "_PropertyAmenities_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PropertyTransports" ADD CONSTRAINT "_PropertyTransports_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PropertyTransports" ADD CONSTRAINT "_PropertyTransports_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TransportOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PropertySurroundings" ADD CONSTRAINT "_PropertySurroundings_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PropertySurroundings" ADD CONSTRAINT "_PropertySurroundings_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."SurroundingType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
