import { Injectable } from "@nestjs/common";

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
}
