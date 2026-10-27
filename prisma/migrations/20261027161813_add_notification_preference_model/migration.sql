-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_preferences_tenant_id_idx" ON "notification_preferences"("tenant_id");

-- CreateIndex
CREATE INDEX "notification_preferences_owner_id_idx" ON "notification_preferences"("owner_id");

-- CreateIndex
CREATE INDEX "notification_preferences_tenant_id_owner_id_idx" ON "notification_preferences"("tenant_id", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_owner_id_channel_category_key" ON "notification_preferences"("owner_id", "channel", "category");
