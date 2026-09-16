import { AuditEvent } from "../../../../domain/entities";
import { AuditEventNotFoundError } from "../../../../domain/errors";
import { AuditMetadata } from "../../../../domain/value-objects";
import { AuditEventRepositorySpy } from "../../../../test-doubles";
import { GetAuditEventUseCase } from "./index";
import type { GetAuditEventInput } from "./input";

const makeInput = (): GetAuditEventInput => ({
    id: "audit-event-id",
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

describe("GetAuditEventUseCase", () => {
    const makeSut = () => {
        const auditEventRepository = new AuditEventRepositorySpy();
        const useCase = new GetAuditEventUseCase(auditEventRepository);
        return { useCase, auditEventRepository };
    };

    it("should return an audit event successfully when it exists", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const mockEvent = makeAuditEvent();
        auditEventRepository.findById.mockResolvedValue(mockEvent);
        const result = await useCase.execute(makeInput());
        expect(auditEventRepository.findById).toHaveBeenCalledTimes(1);
        expect(auditEventRepository.findById).toHaveBeenCalledWith("audit-event-id");
        expect(result).toEqual({ event: mockEvent });
    });

    it("should throw AuditEventNotFoundError when audit event does not exist", async () => {
        const { useCase, auditEventRepository } = makeSut();
        auditEventRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(AuditEventNotFoundError);
        expect(auditEventRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should propagate repository errors when finding audit event", async () => {
        const { useCase, auditEventRepository } = makeSut();
        auditEventRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(auditEventRepository.findById).toHaveBeenCalledTimes(1);
    });
});
