import { type PaginationInput } from "@/shared/pagination";

import type { AuditAction, AuditResource } from "../../../../../domain/catalogs";

export interface ListAuditEventsInput extends PaginationInput {
    userId?: string | undefined;
    tenantId?: string | undefined;
    action?: AuditAction | undefined;
    resource?: AuditResource | undefined;
}
