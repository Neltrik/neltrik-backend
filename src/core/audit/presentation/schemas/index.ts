import { z } from "zod";

import { paginationQuerySchema } from "@/shared/pagination";

import { AUDIT_ACTION, AUDIT_RESOURCE } from "../../domain/catalogs";

export const listAuditEventsQuerySchema = paginationQuerySchema.extend({
    userId: z.uuid().optional(),
    tenantId: z.uuid().optional(),
    action: z.enum(Object.values(AUDIT_ACTION) as [string, ...string[]]).optional(),
    resource: z.enum(Object.values(AUDIT_RESOURCE) as [string, ...string[]]).optional(),
});

export const getAuditEventParamsSchema = z.object({
    id: z.uuid(),
});
