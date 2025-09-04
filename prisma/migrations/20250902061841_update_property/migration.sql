/*
  Warnings:

  - Added the required column `isTravelWithPets` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Property" ADD COLUMN     "isTravelWithPets" BOOLEAN NOT NULL,
ADD COLUMN     "maxPeople" INTEGER,
ADD COLUMN     "propertyType" "public"."PropertyType";
