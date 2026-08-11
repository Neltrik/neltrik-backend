/*
  Warnings:

  - Added the required column `scope` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('PLATFORM', 'TENANT');

-- AlterTable
ALTER TABLE "roles"
ADD COLUMN "scope" "RoleScope";

-- Assign scope to existing roles
UPDATE "roles"
SET "scope" = 'PLATFORM'
WHERE "code" = 'PLATFORM_ADMIN';

-- Make scope required
ALTER TABLE "roles"
ALTER COLUMN "scope" SET NOT NULL;
