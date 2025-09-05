-- AlterTable
ALTER TABLE "public"."PendingUser" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';
