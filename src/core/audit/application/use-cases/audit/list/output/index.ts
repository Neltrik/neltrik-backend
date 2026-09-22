import { type PaginationResult } from "@/shared/pagination";

import type { AuditEvent } from "../../../../../domain/entities";

export type ListAuditEventsOutput = {
    events: AuditEvent[];
    meta: PaginationResult;
};
