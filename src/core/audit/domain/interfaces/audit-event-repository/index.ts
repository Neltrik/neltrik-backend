import type { AuditEvent } from "../../entities";
import { type FindManyAuditEventsParams } from "../../types";

export abstract class AuditEventRepository {
    abstract create(auditEvent: AuditEvent): Promise<void>;
    abstract findById(id: string): Promise<AuditEvent | null>;
    abstract findMany(params: FindManyAuditEventsParams): Promise<AuditEvent[]>;
}
