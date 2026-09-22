import type { PaginationInput } from "@/shared/pagination";

import type { AuditAction, AuditResource } from "../../catalogs";
import type { AuditMetadata, IpAddress } from "../../value-objects";

export const AUDIT_STATUS = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    DENIED: "DENIED",
} as const;
export type AuditStatus = (typeof AUDIT_STATUS)[keyof typeof AUDIT_STATUS];

export interface AuditEventProps {
    id: string;
    userId: string | null;
    userEmail: string | null;
    tenantId: string | null;
    action: string;
    resource: string;
    resourceId: string | null;
    status: AuditStatus;
    metadata: AuditMetadata;
    ipAddress: IpAddress | null;
    userAgent: string | null;
    createdAt: Date;
}

export interface FindManyAuditEventsParams extends PaginationInput {
    userId?: string | undefined;
    tenantId?: string | undefined;
    action?: AuditAction | undefined;
    resource?: AuditResource | undefined;
}
