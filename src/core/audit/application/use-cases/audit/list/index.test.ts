import { AuditEvent } from "../../../../domain/entities";
import { AuditMetadata } from "../../../../domain/value-objects";
import { AuditEventRepositorySpy } from "../../../../test-doubles";
import { ListAuditEventsUseCase } from "./index";
import type { ListAuditEventsInput } from "./input";

const makeInput = (): ListAuditEventsInput => ({
    action: "TENANT_REACTIVATED",
    resource: "TENANT",
    tenantId: "tenant-id",
    userId: "user-id",
});

const makeAuditEvent = (): AuditEvent =>
    AuditEvent.create({
        id: "audit-event-id",
        userId: "user-id",
        userEmail: "test@example.com",
        tenantId: "tenant-id",
        action: "USER_LOGIN",
        resource: "AUTH",
        resourceId: "resource-id",
        status: "SUCCESS",
        metadata: AuditMetadata.create({}),
        ipAddress: null,
        userAgent: "Mozilla/5.0",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("ListAuditEventsUseCase", () => {
    const makeSut = () => {
        const auditEventRepository = new AuditEventRepositorySpy();
        const useCase = new ListAuditEventsUseCase(auditEventRepository);
        return { useCase, auditEventRepository };
    };

    it("should return a list of audit events successfully", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const mockEvents = [makeAuditEvent()];
        auditEventRepository.findMany.mockResolvedValue(mockEvents);
        const input = makeInput();
        const result = await useCase.execute(input);
        expect(auditEventRepository.findMany).toHaveBeenCalledTimes(1);
        expect(auditEventRepository.findMany).toHaveBeenCalledWith({
            action: input.action,
            resource: input.resource,
            tenantId: input.tenantId,
            userId: input.userId,
        });
        expect(result).toEqual(mockEvents);
    });

    it("should return an empty array when no audit events are found", async () => {
        const { useCase, auditEventRepository } = makeSut();
        auditEventRepository.findMany.mockResolvedValue([]);
        const result = await useCase.execute(makeInput());
        expect(auditEventRepository.findMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);
    });

    it("should propagate repository errors when finding audit events", async () => {
        const { useCase, auditEventRepository } = makeSut();
        auditEventRepository.findMany.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(auditEventRepository.findMany).toHaveBeenCalledTimes(1);
    });
});
