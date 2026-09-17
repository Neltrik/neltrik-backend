import type { AuditAction, AuditResource } from "../../../../../domain/catalogs";
import type { AuditStatus } from "../../../../../domain/types";

export type CreateAuditEventInput = {
    userId: string | null;
    userEmail: string | null;
    tenantId: string | null;
    action: AuditAction;
    resource: AuditResource;
    resourceId: string | null;
    status: AuditStatus;
    metadata: Record<string, unknown>;
    ipAddress?: string | null;
    userAgent?: string | null;
};
