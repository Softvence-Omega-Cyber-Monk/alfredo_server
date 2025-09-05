-- AlterTable
ALTER TABLE "public"."Badge" ADD COLUMN     "iconPublicId" TEXT,
ALTER COLUMN "icon" DROP NOT NULL;
