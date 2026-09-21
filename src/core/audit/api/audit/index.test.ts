import { Logger } from "@nestjs/common";

import { type CreateAuditEventInput } from "../../application/use-cases-ohs";
import { AUDIT_STATUS } from "../../domain/types";
import { CreateAuditEventOhsUseCaseSpy } from "../../test-doubles";
import { AuditApiImpl } from "./index";

const makeSut = () => {
    const createAuditEventOhsUseCase = new CreateAuditEventOhsUseCaseSpy();
    const auditApi = new AuditApiImpl(createAuditEventOhsUseCase);
    return { auditApi, createAuditEventOhsUseCase };
};

const makeInput = (): CreateAuditEventInput => ({
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
});

describe("AuditApiImpl", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("record", () => {
        it("should record an audit event successfully", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);
            auditApi.record(input);
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
        });

        it("should log the error when recording fails", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const error = new Error("Database connection error");
            createAuditEventOhsUseCase.execute.mockRejectedValue(error);
            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            auditApi.record(input);
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
            expect(loggerSpy).toHaveBeenCalledWith(`Failed to record audit event: ${input.action}`, error.stack);
        });

        it("should log undefined stack when rejection is not an Error instance", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const nonErrorRejection = "Some unknown error string";
            createAuditEventOhsUseCase.execute.mockRejectedValue(nonErrorRejection);
            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            auditApi.record(input);
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith(input);
            expect(loggerSpy).toHaveBeenCalledWith(`Failed to record audit event: ${input.action}`, undefined);
        });
    });

    describe("recordWithFn", () => {
        it("should return the function result and record a successful audit", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const result = { id: "result-id" };
            const fn = jest.fn().mockResolvedValue(result);
            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);
            await expect(auditApi.recordWithFn(input, fn)).resolves.toEqual(result);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                ...input,
                status: AUDIT_STATUS.SUCCESS,
            });
        });

        it("should propagate the function error and record a failed audit", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const error = new Error("Operation failed");
            const fn = jest.fn().mockRejectedValue(error);
            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);
            await expect(auditApi.recordWithFn(input, fn)).rejects.toThrow("Operation failed");
            expect(fn).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                ...input,
                status: AUDIT_STATUS.FAILED,
            });
        });

        it("should log when successful audit recording fails", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const auditError = new Error("Audit database error");
            const result = "success";
            const fn = jest.fn().mockResolvedValue(result);
            createAuditEventOhsUseCase.execute.mockRejectedValue(auditError);
            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            await expect(auditApi.recordWithFn(input, fn)).resolves.toBe(result);
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                ...input,
                status: AUDIT_STATUS.SUCCESS,
            });
            expect(loggerSpy).toHaveBeenCalledWith("Audit failed", auditError);
        });

        it("should log when failed audit recording fails", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const operationError = new Error("Operation failed");
            const auditError = new Error("Audit database error");
            const fn = jest.fn().mockRejectedValue(operationError);
            createAuditEventOhsUseCase.execute.mockRejectedValue(auditError);
            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            await expect(auditApi.recordWithFn(input, fn)).rejects.toThrow("Operation failed");
            await Promise.resolve();
            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                ...input,
                status: AUDIT_STATUS.FAILED,
            });
            expect(loggerSpy).toHaveBeenCalledWith("Audit failed", auditError);
        });

        it("should preserve the original result when successful audit recording fails", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const result = { id: "result-id", value: 123 };
            const fn = jest.fn().mockResolvedValue(result);
            createAuditEventOhsUseCase.execute.mockRejectedValue(new Error("Audit failed"));
            jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            await expect(auditApi.recordWithFn(input, fn)).resolves.toEqual(result);
        });

        it("should preserve the original operation error when failed audit recording fails", async () => {
            const { auditApi, createAuditEventOhsUseCase } = makeSut();
            const input = makeInput();
            const operationError = new Error("Operation failed");
            const auditError = new Error("Audit failed");
            const fn = jest.fn().mockRejectedValue(operationError);
            createAuditEventOhsUseCase.execute.mockRejectedValue(auditError);
            jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
            await expect(auditApi.recordWithFn(input, fn)).rejects.toBe(operationError);
        });
    });
});
