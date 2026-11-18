/*
  Warnings:

  - Added the required column `expires_at` to the `memberships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "memberships_status_expires_at_idx" ON "memberships"("status", "expires_at");
