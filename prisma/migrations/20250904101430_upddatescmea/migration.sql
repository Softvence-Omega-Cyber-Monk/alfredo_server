/*
  Warnings:

  - You are about to drop the column `authorImage` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `authorName` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `articles` table. All the data in the column will be lost.
  - Added the required column `userId` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."articles_slug_key";

-- AlterTable
ALTER TABLE "public"."articles" DROP COLUMN "authorImage",
DROP COLUMN "authorName",
DROP COLUMN "lastUpdated",
DROP COLUMN "slug",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."articles" ADD CONSTRAINT "articles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
