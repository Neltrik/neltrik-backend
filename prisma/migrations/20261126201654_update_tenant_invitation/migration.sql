/*
  Warnings:

  - You are about to drop the column `role_id` on the `invitations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vacancies" DROP CONSTRAINT "vacancies_tenant_id_fkey";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "role_id";

-- CreateIndex
CREATE INDEX "invitations_tenant_id_recipient_idx" ON "invitations"("tenant_id", "recipient");
