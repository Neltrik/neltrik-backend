import { Injectable } from "@nestjs/common";

import type { AuditEvent } from "../../../../domain/entities";
import { AuditEventRepository } from "../../../../domain/interfaces";
import { ListAuditEventsInput } from "./input";

@Injectable()
export class ListAuditEventsUseCase {
    constructor(private readonly auditEventRepository: AuditEventRepository) {}

    public async execute(input: ListAuditEventsInput): Promise<AuditEvent[]> {
        const events = await this.auditEventRepository.findMany({
            action: input.action,
            resource: input.resource,
            tenantId: input.tenantId,
            userId: input.userId,
        });
        return events;
    }
}
