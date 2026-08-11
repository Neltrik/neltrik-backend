-- CreateTable
CREATE TABLE "role_tenants" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_tenants_role_id_idx" ON "role_tenants"("role_id");

-- CreateIndex
CREATE INDEX "role_tenants_tenant_id_idx" ON "role_tenants"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_tenants_role_id_tenant_id_key" ON "role_tenants"("role_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "role_tenants" ADD CONSTRAINT "role_tenants_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_tenants" ADD CONSTRAINT "role_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
