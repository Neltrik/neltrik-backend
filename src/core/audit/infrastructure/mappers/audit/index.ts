import type { AuditEvent as PrismaAuditEvent, Prisma } from "@prisma/client";

import { AuditEvent } from "../../../domain/entities";
import { AuditMetadata, IpAddress } from "../../../domain/value-objects";

export class AuditEventMapper {
    public static toPersistence(auditEvent: AuditEvent): Prisma.AuditEventCreateInput {
        return {
            id: auditEvent.id,
            userId: auditEvent.userId,
            userEmail: auditEvent.userEmail,
            tenantId: auditEvent.tenantId,
            action: auditEvent.action,
            resource: auditEvent.resource,
            resourceId: auditEvent.resourceId,
            status: auditEvent.status,
            metadata: auditEvent.metadata.toJSON(),
            ipAddress: auditEvent.ipAddress?.value ?? null,
            userAgent: auditEvent.userAgent,
            createdAt: auditEvent.createdAt,
        };
    }

    public static toDomain(auditEvent: PrismaAuditEvent): AuditEvent {
        return AuditEvent.restore({
            id: auditEvent.id,
            userId: auditEvent.userId,
            userEmail: auditEvent.userEmail,
            tenantId: auditEvent.tenantId,
            action: auditEvent.action,
            resource: auditEvent.resource,
            resourceId: auditEvent.resourceId,
            status: auditEvent.status,
            metadata: AuditMetadata.create(auditEvent.metadata),
            ipAddress: auditEvent.ipAddress ? IpAddress.create(auditEvent.ipAddress) : null,
            userAgent: auditEvent.userAgent,
            createdAt: auditEvent.createdAt,
        });
    }
}
