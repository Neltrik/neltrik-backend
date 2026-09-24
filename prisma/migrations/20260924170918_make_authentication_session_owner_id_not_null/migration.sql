/*
  Warnings:

  - Made the column `owner_id` on table `authentication_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "authentication_sessions" DROP CONSTRAINT "authentication_sessions_owner_id_fkey";

-- AlterTable
ALTER TABLE "audit_events" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "authentication_sessions" ALTER COLUMN "owner_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "authentication_sessions" ADD CONSTRAINT "authentication_sessions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
