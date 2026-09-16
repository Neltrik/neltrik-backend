import { Injectable } from "@nestjs/common";

import { FindManyAuditEventsParams } from "@/core/audit/domain/types";
import { PrismaService } from "@/prisma/index";

import { AuditEvent } from "../../../domain/entities";
import { AuditEventRepository } from "../../../domain/interfaces";
import { AuditEventMapper } from "../../mappers";

@Injectable()
export class PrismaAuditEventRepository extends AuditEventRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    public async create(auditEvent: AuditEvent): Promise<void> {
        await this.prisma.tenantClient.auditEvent.create({
            data: AuditEventMapper.toPersistence(auditEvent),
        });
    }

    public async findById(id: string): Promise<AuditEvent | null> {
        const auditEvent = await this.prisma.tenantClient.auditEvent.findUnique({ where: { id } });
        if (!auditEvent) {
            return null;
        }
        return AuditEventMapper.toDomain(auditEvent);
    }

    public async findMany(params: FindManyAuditEventsParams): Promise<AuditEvent[]> {
        const auditEvents = await this.prisma.tenantClient.auditEvent.findMany({
            where: {
                ...(params.userId && { userId: params.userId }),
                ...(params.tenantId && { tenantId: params.tenantId }),
                ...(params.action && { action: params.action }),
                ...(params.resource && { resource: params.resource }),
            },
            orderBy: { createdAt: "desc" },
        });
        return auditEvents.map((audit) => AuditEventMapper.toDomain(audit));
    }
}
