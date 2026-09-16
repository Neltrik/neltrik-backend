import type { AuditEvent } from "../../entities";

export abstract class AuditEventRepository {
    abstract create(auditEvent: AuditEvent): Promise<void>;
    abstract findById(id: string): Promise<AuditEvent | null>;
}
