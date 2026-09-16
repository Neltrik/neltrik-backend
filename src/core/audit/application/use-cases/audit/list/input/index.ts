import type { AuditAction, AuditResource } from "../../../../../domain/catalogs";

export interface ListAuditEventsInput {
    userId?: string;
    tenantId?: string;
    action?: AuditAction;
    resource?: AuditResource;
}
