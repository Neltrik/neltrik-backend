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
    limit: 20,
});

const makeAuditEvent = (id = "audit-event-id"): AuditEvent =>
    AuditEvent.create({
        id,
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
        const input = makeInput();
        const mockEvents = [makeAuditEvent()];
        auditEventRepository.findMany.mockResolvedValue(mockEvents);
        const result = await useCase.execute(input);
        expect(auditEventRepository.findMany).toHaveBeenCalledTimes(1);
        expect(auditEventRepository.findMany).toHaveBeenCalledWith({
            action: input.action,
            resource: input.resource,
            tenantId: input.tenantId,
            userId: input.userId,
            cursor: input.cursor,
            limit: input.limit,
        });
        expect(result).toEqual({ events: mockEvents, meta: { nextCursor: null, hasMore: false } });
    });

    it("should return an empty list when no audit events are found", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const input = makeInput();
        auditEventRepository.findMany.mockResolvedValue([]);
        const result = await useCase.execute(input);
        expect(auditEventRepository.findMany).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ events: [], meta: { nextCursor: null, hasMore: false } });
    });

    it("should return the first page and next cursor when there are more events than the limit", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const input = { ...makeInput(), limit: 2 };
        const mockEvents = [
            makeAuditEvent("audit-event-1"),
            makeAuditEvent("audit-event-2"),
            makeAuditEvent("audit-event-3"),
        ];
        auditEventRepository.findMany.mockResolvedValue(mockEvents);
        const result = await useCase.execute(input);
        expect(result).toEqual({
            events: [mockEvents[0], mockEvents[1]],
            meta: { nextCursor: "audit-event-2", hasMore: true },
        });
    });

    it("should propagate repository errors when finding audit events", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const error = new Error("Database error");
        auditEventRepository.findMany.mockRejectedValue(error);
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(auditEventRepository.findMany).toHaveBeenCalledTimes(1);
    });
});
