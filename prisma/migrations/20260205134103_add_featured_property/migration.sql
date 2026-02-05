-- CreateTable
CREATE TABLE "public"."FeaturedProperty" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedProperty_propertyId_key" ON "public"."FeaturedProperty"("propertyId");

-- AddForeignKey
ALTER TABLE "public"."FeaturedProperty" ADD CONSTRAINT "FeaturedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
