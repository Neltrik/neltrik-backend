-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'READY', 'INFECTED', 'ARCHIVED', 'DELETED');

-- AlterTable
ALTER TABLE "audit_events" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" BIGINT NOT NULL,
    "purpose" VARCHAR(50) NOT NULL,
    "status" "FileStatus" NOT NULL DEFAULT 'PENDING',
    "resource_type" VARCHAR(50) NOT NULL,
    "resource_id" UUID NOT NULL,
    "versions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "files_tenant_id_idx" ON "files"("tenant_id");

-- CreateIndex
CREATE INDEX "files_owner_id_idx" ON "files"("owner_id");

-- CreateIndex
CREATE INDEX "files_resource_type_resource_id_idx" ON "files"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "files_tenant_id_status_idx" ON "files"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "files_tenant_id_purpose_idx" ON "files"("tenant_id", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "files_tenant_id_resource_type_resource_id_purpose_key" ON "files"("tenant_id", "resource_type", "resource_id", "purpose") WHERE "status" IN ('PENDING', 'READY', 'INFECTED');
