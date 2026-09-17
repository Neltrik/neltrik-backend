import type { IdGenerator } from "@/shared/id-generator";

import { AUDIT_ACTION, AUDIT_RESOURCE } from "../../../../domain/catalogs";
import { InvalidAuditActionError, InvalidAuditResourceError } from "../../../../domain/errors";
import { AuditEventRepositorySpy } from "../../../../test-doubles";
import { CreateAuditEventOhsUseCase } from "./index";
import type { CreateAuditEventInput } from "./input";

const makeInput = (): CreateAuditEventInput => ({
    userId: "user-id",
    userEmail: "test@example.com",
    tenantId: "tenant-id",
    action: AUDIT_ACTION.TENANT_REACTIVATED,
    resource: AUDIT_RESOURCE.TENANT,
    resourceId: "resource-id",
    status: "SUCCESS",
    metadata: {},
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
});

describe("CreateAuditEventOhsUseCase", () => {
    const makeSut = () => {
        const auditEventRepository = new AuditEventRepositorySpy();
        auditEventRepository.create.mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("audit-event-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const useCase = new CreateAuditEventOhsUseCase(idGenerator, auditEventRepository);
        return { useCase, auditEventRepository, generateMock };
    };

    it("should create an audit event successfully", async () => {
        const { useCase, auditEventRepository, generateMock } = makeSut();
        const result = await useCase.execute({ ...makeInput(), ipAddress: null, userAgent: null });
        expect(generateMock).toHaveBeenCalledTimes(1);
        expect(auditEventRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ id: "audit-event-id" });
    });

    it("should throw InvalidAuditActionError when action is invalid", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const input = { ...makeInput(), action: "INVALID_ACTION" };
        await expect(useCase.execute(input as CreateAuditEventInput)).rejects.toThrow(InvalidAuditActionError);
        expect(auditEventRepository.create).not.toHaveBeenCalled();
    });

    it("should throw InvalidAuditResourceError when resource is invalid", async () => {
        const { useCase, auditEventRepository } = makeSut();
        const input = { ...makeInput(), resource: "INVALID_RESOURCE" };
        await expect(useCase.execute(input as CreateAuditEventInput)).rejects.toThrow(InvalidAuditResourceError);
        expect(auditEventRepository.create).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when creating audit event", async () => {
        const { useCase, auditEventRepository } = makeSut();
        auditEventRepository.create.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(auditEventRepository.create).toHaveBeenCalledTimes(1);
    });
});
