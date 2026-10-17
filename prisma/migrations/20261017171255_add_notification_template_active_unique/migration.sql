-- Partial unique index: only one active template per (code, channel, locale, tenant_id)
-- NULLS NOT DISTINCT ensures only one global template (tenant_id = NULL) per combination
CREATE UNIQUE INDEX "notification_templates_active_unique"
ON "notification_templates" ("code", "channel", "locale", "tenant_id")
NULLS NOT DISTINCT
WHERE "is_active" = TRUE;