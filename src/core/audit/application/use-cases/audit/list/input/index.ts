import type { AuditAction, AuditResource } from "../../../../../domain/catalogs";

export interface ListAuditEventsInput {
    userId?: string | undefined;
    tenantId?: string | undefined;
    action?: AuditAction | undefined;
    resource?: AuditResource | undefined;
}
