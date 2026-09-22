import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { AuditEventRepository } from "../../../../domain/interfaces";
import { ListAuditEventsInput } from "./input";
import { ListAuditEventsOutput } from "./output";

@Injectable()
export class ListAuditEventsUseCase {
    constructor(private readonly auditEventRepository: AuditEventRepository) {}

    public async execute(input: ListAuditEventsInput): Promise<ListAuditEventsOutput> {
        const events = await this.auditEventRepository.findMany({
            action: input.action,
            resource: input.resource,
            tenantId: input.tenantId,
            userId: input.userId,
            cursor: input.cursor,
            limit: input.limit,
        });
        const { items, meta } = paginate({
            items: events,
            limit: input.limit,
            getId: (event) => event.id,
        });
        return { events: items, meta };
    }
}
