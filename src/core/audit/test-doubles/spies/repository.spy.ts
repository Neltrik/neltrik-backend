import { type AuditEvent } from "../../domain/entities";
import { AuditEventRepository } from "../../domain/interfaces";
import { type FindManyAuditEventsParams } from "../../domain/types";

export class AuditEventRepositorySpy extends AuditEventRepository {
    public create = jest.fn<Promise<void>, [AuditEvent]>();
    public findById = jest.fn<Promise<AuditEvent | null>, [string]>();
    public findMany = jest.fn<Promise<AuditEvent[]>, [FindManyAuditEventsParams]>();
}
