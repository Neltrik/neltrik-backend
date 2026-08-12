-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('PLATFORM', 'CUSTOMER');

-- AlterTable
ALTER TABLE "tenants"
ADD COLUMN "type" "TenantType";

-- Existing tenants are customer tenants
UPDATE "tenants"
SET "type" = 'CUSTOMER';

-- Make type mandatory
ALTER TABLE "tenants"
ALTER COLUMN "type" SET NOT NULL;

-- Only one PLATFORM tenant is allowed
CREATE UNIQUE INDEX "tenants_single_platform_idx"
ON "tenants" ("type")
WHERE "type" = 'PLATFORM';