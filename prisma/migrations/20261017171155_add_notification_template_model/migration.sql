-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "code" VARCHAR(100) NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "subject" VARCHAR(255),
    "body" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_templates_tenant_id_idx" ON "notification_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "notification_templates_code_idx" ON "notification_templates"("code");

-- CreateIndex
CREATE INDEX "notification_templates_code_channel_locale_idx" ON "notification_templates"("code", "channel", "locale");

-- CreateIndex
CREATE INDEX "notification_templates_tenant_id_code_channel_locale_idx" ON "notification_templates"("tenant_id", "code", "channel", "locale");
