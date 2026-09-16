import { Injectable } from "@nestjs/common";

import { AuditEventNotFoundError } from "../../../../domain/errors";
import { AuditEventRepository } from "../../../../domain/interfaces";
import { GetAuditEventInput } from "./input";
import { GetAuditEventOutput } from "./output";

@Injectable()
export class GetAuditEventUseCase {
    constructor(private readonly auditEventRepository: AuditEventRepository) {}

    public async execute(input: GetAuditEventInput): Promise<GetAuditEventOutput> {
        const event = await this.auditEventRepository.findById(input.id);
        if (!event) {
            throw new AuditEventNotFoundError();
        }
        return { event };
    }
}
