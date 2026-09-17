import { Logger } from "@nestjs/common";

import { type CreateAuditEventInput } from "../../application/use-cases-ohs";
import { CreateAuditEventOhsUseCaseSpy } from "../../test-doubles";
import { AuditApiImpl } from "./index";

const makeSut = () => {
    const createAuditEventOhsUseCase = new CreateAuditEventOhsUseCaseSpy();
    const auditApi = new AuditApiImpl(createAuditEventOhsUseCase);
    return { auditApi, createAuditEventOhsUseCase };
};

describe("AuditApiImpl", () => {
    describe("record", () => {
        it("should record an audit event successfully", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input: CreateAuditEventInput = {
                action: "TENANT_REACTIVATED",
                userId: "user-id",
                tenantId: "tenant-id",
                ipAddress: "",
                metadata: {},
                resource: "TENANT",
                resourceId: "",
                status: "DENIED",
                userAgent: "",
                userEmail: "",
            };
            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);
            auditApi.record(input);
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
        });

        it("should record an audit event successfully", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input: CreateAuditEventInput = {
                action: "TENANT_REACTIVATED",
                userId: "user-id",
                tenantId: "tenant-id",
                ipAddress: "",
                metadata: {},
                resource: "TENANT",
                resourceId: "",
                status: "DENIED",
                userAgent: "",
                userEmail: "",
            };
            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);
            auditApi.record(input);
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
        });

        it("should catch errors and log them when recording fails", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input: CreateAuditEventInput = {
                action: "TENANT_REACTIVATED",
                userId: "user-id",
                tenantId: "tenant-id",
                ipAddress: "",
                metadata: {},
                resource: "TENANT",
                resourceId: "",
                status: "DENIED",
                userAgent: "",
                userEmail: "",
            };
            const error = new Error("Database connection error");
            createAuditEventOhsUseCase.execute.mockRejectedValue(error);
            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            auditApi.record(input);
            await new Promise((resolve) => setImmediate(resolve));
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
            expect(loggerSpy).toHaveBeenCalledWith(`Failed to record audit event: ${input.action}`, error.stack);
            loggerSpy.mockRestore();
        });

        it("should log error with undefined stack when rejection is not an Error instance", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input: CreateAuditEventInput = {
                action: "TENANT_REACTIVATED",
                userId: "user-id",
                tenantId: "tenant-id",
                ipAddress: "",
                metadata: {},
                resource: "TENANT",
                resourceId: "",
                status: "DENIED",
                userAgent: "",
                userEmail: "",
            };
            const nonErrorRejection = "Some unknown error string";
            createAuditEventOhsUseCase.execute.mockRejectedValue(nonErrorRejection);
            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            auditApi.record(input);
            await new Promise((resolve) => setImmediate(resolve));
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
            expect(loggerSpy).toHaveBeenCalledWith(`Failed to record audit event: ${input.action}`, undefined);
            loggerSpy.mockRestore();
        });
    });
});
