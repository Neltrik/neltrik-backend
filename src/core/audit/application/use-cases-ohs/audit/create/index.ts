import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";

import { AUDIT_ACTION, AUDIT_RESOURCE } from "../../../../domain/catalogs";
import { AuditEvent } from "../../../../domain/entities";
import { InvalidAuditActionError, InvalidAuditResourceError } from "../../../../domain/errors";
import { AuditEventRepository } from "../../../../domain/interfaces";
import { AuditMetadata, IpAddress } from "../../../../domain/value-objects";
import { CreateAuditEventInput } from "./input";
import { CreateAuditEventOutput } from "./output";

@Injectable()
export class CreateAuditEventOhsUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly auditEventRepository: AuditEventRepository,
    ) {}

    public async execute(input: CreateAuditEventInput): Promise<CreateAuditEventOutput> {
        const actions = Object.values(AUDIT_ACTION);
        if (!actions.includes(input.action)) {
            throw new InvalidAuditActionError();
        }
        const resources = Object.values(AUDIT_RESOURCE);
        if (!resources.includes(input.resource)) {
            throw new InvalidAuditResourceError();
        }
        const now = new Date();
        const auditEvent = AuditEvent.create({
            id: this.idGenerator.generate(),
            userId: input.userId,
            userEmail: input.userEmail,
            tenantId: input.tenantId,
            action: input.action,
            resource: input.resource,
            resourceId: input.resourceId,
            status: input.status,
            metadata: AuditMetadata.create(input.metadata),
            ipAddress: input.ipAddress ? IpAddress.create(input.ipAddress) : null,
            userAgent: input.userAgent ?? null,
            createdAt: now,
        });
        await this.auditEventRepository.create(auditEvent);
        return { id: auditEvent.id };
    }
}

export { type CreateAuditEventInput };
