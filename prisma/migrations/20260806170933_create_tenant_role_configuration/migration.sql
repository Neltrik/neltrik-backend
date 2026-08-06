-- CreateTable
CREATE TABLE "tenant_role_configurations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_role_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tenant_role_configurations_tenant_id_idx" ON "tenant_role_configurations"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_role_configurations_role_id_idx" ON "tenant_role_configurations"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_role_configurations_tenant_id_role_id_key" ON "tenant_role_configurations"("tenant_id", "role_id");

-- AddForeignKey
ALTER TABLE "tenant_role_configurations" ADD CONSTRAINT "tenant_role_configurations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_role_configurations" ADD CONSTRAINT "tenant_role_configurations_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
