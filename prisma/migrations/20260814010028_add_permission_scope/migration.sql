/*
  Warnings:

  - Added the required column `scope` to the `permissions` table.
    Existing permissions are classified explicitly below.
*/

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('PLATFORM', 'TENANT');

-- AlterTable
ALTER TABLE "permissions"
ADD COLUMN "scope" "PermissionScope";

-- Platform permissions
UPDATE "permissions"
SET "scope" = 'PLATFORM'
WHERE "code" IN (
  'TENANT_CREATE',
  'TENANT_GET',
  'TENANT_UPDATE',
  'TENANT_SUSPEND',
  'TENANT_REACTIVATE',
  'TENANT_LIST',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_LIST',
  'ROLE_ASSIGN_PERMISSIONS',
  'ROLE_REMOVE_PERMISSIONS',
  'ROLE_LIST_PERMISSIONS',
  'PERMISSION_CREATE',
  'PERMISSION_LIST',
  'PERMISSION_UPDATE',
  'TENANT_ROLE_CONFIGURATION_CREATE',
  'TENANT_ROLE_CONFIGURATION_LIST',
  'TENANT_ROLE_CONFIGURATION_UPDATE',
  'TENANT_ROLE_CONFIGURATION_DELETE',
  'ROLE_TENANT_LIST',
  'ROLE_TENANT_CREATE',
  'ROLE_TENANT_DELETE'
);

-- Tenant permissions
UPDATE "permissions"
SET "scope" = 'TENANT'
WHERE "code" IN (
  'USER_CREATE',
  'USER_UPDATE',
  'USER_LIST',
  'USER_SUSPEND',
  'USER_REACTIVATE'
);

-- Make scope required
ALTER TABLE "permissions"
ALTER COLUMN "scope" SET NOT NULL;
