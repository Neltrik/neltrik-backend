import { EmptyActionError, EmptyResourceError } from "../../errors";
import type { AuditEventProps } from "../../types";
import { AuditMetadata, IpAddress } from "../../value-objects";
import { AuditEvent } from "./index";

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
        metadata: AuditMetadata.create({}),
        ipAddress: IpAddress.create("192.168.1.1"),
        userAgent: "Mozilla/5.0",
        createdAt,
    };
};

describe("AuditEvent", () => {
    it("should restore an audit event", () => {
        const auditEvent = AuditEvent.restore(createProps());
        expect(auditEvent.id).toBe("audit-event-id");
    });

    it("should create an audit event", () => {
        const auditEvent = AuditEvent.create(createProps());
        expect(auditEvent.id).toBe("audit-event-id");
    });

    it("should expose all properties through getters", () => {
        const props = createProps();
        const auditEvent = AuditEvent.create(props);
        expect(auditEvent.id).toBe(props.id);
        expect(auditEvent.userId).toBe(props.userId);
        expect(auditEvent.userEmail).toBe(props.userEmail);
        expect(auditEvent.tenantId).toBe(props.tenantId);
        expect(auditEvent.action).toBe(props.action);
        expect(auditEvent.resource).toBe(props.resource);
        expect(auditEvent.resourceId).toBe(props.resourceId);
        expect(auditEvent.status).toBe(props.status);
        expect(auditEvent.metadata).toBe(props.metadata);
        expect(auditEvent.ipAddress).toBe(props.ipAddress);
        expect(auditEvent.userAgent).toBe(props.userAgent);
        expect(auditEvent.createdAt).toEqual(props.createdAt);
    });
});

describe("Validations", () => {
    it.each([
        ["empty string", ""],
        ["whitespace string", "   "],
        ["null value", null as unknown as string],
        ["undefined value", undefined as unknown as string],
    ])("should throw EmptyActionError when action is %s", (_, invalidAction) => {
        const props = { ...createProps(), action: invalidAction };
        expect(() => AuditEvent.create(props)).toThrow(EmptyActionError);
    });

    it.each([
        ["empty string", ""],
        ["whitespace string", "   "],
        ["null value", null as unknown as string],
        ["undefined value", undefined as unknown as string],
    ])("should throw EmptyResourceError when resource is %s", (_, invalidResource) => {
        const props = { ...createProps(), resource: invalidResource };
        expect(() => AuditEvent.create(props)).toThrow(EmptyResourceError);
    });
});
