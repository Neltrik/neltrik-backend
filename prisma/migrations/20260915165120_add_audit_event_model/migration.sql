-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAILED', 'DENIED');

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "user_email" VARCHAR(255),
    "tenant_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "status" "AuditStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_user_id_idx" ON "audit_events"("user_id");

-- CreateIndex
CREATE INDEX "audit_events_tenant_id_idx" ON "audit_events"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_events_action_idx" ON "audit_events"("action");

-- CreateIndex
CREATE INDEX "audit_events_resource_idx" ON "audit_events"("resource");

-- CreateIndex
CREATE INDEX "audit_events_created_at_idx" ON "audit_events"("created_at");

-- CreateIndex
CREATE INDEX "audit_events_tenant_id_created_at_idx" ON "audit_events"("tenant_id", "created_at");
