-- DropIndex
DROP INDEX "files_tenant_id_resource_type_resource_id_purpose_key";

-- AlterEnum
BEGIN;
CREATE TYPE "FileStatus_new" AS ENUM ('PENDING', 'READY', 'INFECTED', 'DELETED');
ALTER TABLE "public"."files" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "files" ALTER COLUMN "status" TYPE "FileStatus_new" USING ("status"::text::"FileStatus_new");
ALTER TYPE "FileStatus" RENAME TO "FileStatus_old";
ALTER TYPE "FileStatus_new" RENAME TO "FileStatus";
DROP TYPE "public"."FileStatus_old";
ALTER TABLE "files" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "audit_events" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- AlterTable
ALTER TABLE "files" DROP COLUMN "archived_at";

-- CreateIndex
CREATE UNIQUE INDEX "files_tenant_id_resource_type_resource_id_purpose_key" ON "files"("tenant_id", "resource_type", "resource_id", "purpose") WHERE "status" IN ('PENDING', 'READY', 'INFECTED');