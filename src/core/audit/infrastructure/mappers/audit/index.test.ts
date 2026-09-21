import type { AuditEvent as PrismaAuditEvent } from "@prisma/client";

import { AuditEvent } from "../../../domain/entities";
import type { AuditEventProps } from "../../../domain/types";
import { AuditMetadata, IpAddress } from "../../../domain/value-objects";
import { AuditEventMapper } from "./index";

const createProps = (): AuditEventProps => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return {
        id: "audit-event-id",
        userId: "user-id",
        userEmail: "test@example.com",
        tenantId: "tenant-id",
        action: "USER_LOGIN",
        resource: "AUTH",
        resourceId: "resource-id",
        status: "SUCCESS",
        metadata: AuditMetadata.create({ key: "value" }),
        ipAddress: IpAddress.create("192.168.1.1"),
        userAgent: "Mozilla/5.0",
        createdAt,
    };
};

describe("AuditEventMapper", () => {
    it("should map a domain audit event to persistence", () => {
        const auditEvent = AuditEvent.restore(createProps());
        const persistence = AuditEventMapper.toPersistence(auditEvent);
        expect(persistence).toEqual({
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
        });
    });

    it("should map a persistence audit event to domain", () => {
        const props = createProps();
        const persistence: PrismaAuditEvent = {
            id: props.id,
            userId: props.userId,
            userEmail: props.userEmail,
            tenantId: props.tenantId,
            action: props.action,
            resource: props.resource,
            resourceId: props.resourceId,
            status: props.status,
            metadata: { key: "value" },
            ipAddress: props.ipAddress?.value ?? null,
            userAgent: props.userAgent,
            createdAt: props.createdAt,
        };
        const auditEvent = AuditEventMapper.toDomain(persistence);
        expect(auditEvent).toBeInstanceOf(AuditEvent);
        expect(auditEvent.id).toBe(persistence.id);
        expect(auditEvent.userId).toBe(persistence.userId);
        expect(auditEvent.userEmail).toBe(persistence.userEmail);
        expect(auditEvent.tenantId).toBe(persistence.tenantId);
        expect(auditEvent.action).toBe(persistence.action);
        expect(auditEvent.resource).toBe(persistence.resource);
        expect(auditEvent.resourceId).toBe(persistence.resourceId);
        expect(auditEvent.status).toBe(persistence.status);
        expect(auditEvent.metadata.toJSON()).toEqual(persistence.metadata);
        expect(auditEvent.ipAddress?.value).toBe(persistence.ipAddress);
        expect(auditEvent.userAgent).toBe(persistence.userAgent);
        expect(auditEvent.createdAt).toEqual(persistence.createdAt);
    });

    it("should map a persistence audit event to domain without an IP address", () => {
        const props = createProps();
        const persistence: PrismaAuditEvent = {
            id: props.id,
            userId: props.userId,
            userEmail: props.userEmail,
            tenantId: props.tenantId,
            action: props.action,
            resource: props.resource,
            resourceId: props.resourceId,
            status: props.status,
            metadata: { key: "value" },
            ipAddress: null,
            userAgent: props.userAgent,
            createdAt: props.createdAt,
        };
        const auditEvent = AuditEventMapper.toDomain(persistence);
        expect(auditEvent).toBeInstanceOf(AuditEvent);
        expect(auditEvent.ipAddress).toBeNull();
    });

    it("should map a domain audit event without an IP address to persistence", () => {
        const props = createProps();
        const auditEvent = AuditEvent.restore({ ...props, ipAddress: null });
        const persistence = AuditEventMapper.toPersistence(auditEvent);
        expect(persistence.ipAddress).toBeNull();
    });
});
