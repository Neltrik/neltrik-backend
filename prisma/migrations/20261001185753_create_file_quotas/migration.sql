-- CreateTable
CREATE TABLE "file_quotas" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "limit_bytes" BIGINT NOT NULL,
    "used_bytes" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_quotas_tenant_id_key" ON "file_quotas"("tenant_id");

-- CheckConstraints
ALTER TABLE "file_quotas"
  ADD CONSTRAINT "file_quotas_limit_bytes_positive" CHECK ("limit_bytes" > 0);

ALTER TABLE "file_quotas"
  ADD CONSTRAINT "file_quotas_used_bytes_non_negative" CHECK ("used_bytes" >= 0);