import { Logger } from "@nestjs/common";

import { type AuditRecordInput } from "@/shared/audit";

import { AUDIT_ACTION, AUDIT_RESOURCE } from "../../../domain/catalogs";
import { AUDIT_STATUS } from "../../../domain/types";
import { CreateAuditEventOhsUseCaseSpy } from "../../../test-doubles";
import { AuditRecorderProvider } from "./";

const makeSut = () => {
    const createAuditEventOhsUseCase = new CreateAuditEventOhsUseCaseSpy();

    const auditRecorder = new AuditRecorderProvider(createAuditEventOhsUseCase);

    return {
        auditRecorder,
        createAuditEventOhsUseCase,
    };
};

const makeInput = (): AuditRecordInput => ({
    action: AUDIT_ACTION.TENANT_REACTIVATED,
    resource: AUDIT_RESOURCE.TENANT,
    resourceId: "resource-id",
    userId: "user-id",
    userEmail: "user@example.com",
    tenantId: "tenant-id",
    status: AUDIT_STATUS.DENIED,
    metadata: {
        key: "value",
    },
});

describe("AuditRecorderProvider", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("record", () => {
        it("should record a valid audit event", async () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();

            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);

            auditRecorder.record(input);

            await Promise.resolve();

            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);

            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                action: input.action,
                resource: input.resource,
                resourceId: input.resourceId,
                userId: input.userId,
                userEmail: input.userEmail,
                tenantId: input.tenantId,
                status: input.status,
                metadata: input.metadata,
                ipAddress: null,
                userAgent: null,
            });
        });

        it("should use an empty object when metadata is undefined", async () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();

            delete input.metadata;

            createAuditEventOhsUseCase.execute.mockResolvedValue(undefined);

            auditRecorder.record(input);

            await Promise.resolve();

            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                action: input.action,
                resource: input.resource,
                resourceId: input.resourceId,
                userId: input.userId,
                userEmail: input.userEmail,
                tenantId: input.tenantId,
                status: input.status,
                metadata: {},
                ipAddress: null,
                userAgent: null,
            });
        });

        it("should log an error and not record when the action is invalid", () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            input.action = "INVALID_ACTION";

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            expect(loggerSpy).toHaveBeenCalledWith("Invalid audit action: INVALID_ACTION");

            expect(createAuditEventOhsUseCase.execute).not.toHaveBeenCalled();
        });

        it("should log an error and not record when the resource is invalid", () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            input.resource = "INVALID_RESOURCE";

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            expect(loggerSpy).toHaveBeenCalledWith("Invalid audit resource: INVALID_RESOURCE");

            expect(createAuditEventOhsUseCase.execute).not.toHaveBeenCalled();
        });

        it("should log an error and not record when the status is invalid", () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            input.status = "INVALID_STATUS";

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            expect(loggerSpy).toHaveBeenCalledWith("Invalid audit status: INVALID_STATUS");

            expect(createAuditEventOhsUseCase.execute).not.toHaveBeenCalled();
        });

        it("should log the error when recording the audit event fails", async () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            const error = new Error("Database connection error");

            createAuditEventOhsUseCase.execute.mockRejectedValue(error);

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            await Promise.resolve();

            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledWith({
                action: input.action,
                resource: input.resource,
                resourceId: input.resourceId,
                userId: input.userId,
                userEmail: input.userEmail,
                tenantId: input.tenantId,
                status: input.status,
                metadata: input.metadata,
                ipAddress: null,
                userAgent: null,
            });

            expect(loggerSpy).toHaveBeenCalledWith(`Failed to record audit event: ${input.action}`, error.stack);
        });

        it("should log undefined stack when recording fails with a non-Error rejection", async () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            const nonErrorRejection = "Unknown audit error";

            createAuditEventOhsUseCase.execute.mockRejectedValue(nonErrorRejection);

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            await Promise.resolve();

            expect(createAuditEventOhsUseCase.execute).toHaveBeenCalledTimes(1);

            expect(loggerSpy).toHaveBeenCalledWith(`Failed to record audit event: ${input.action}`, undefined);
        });

        it("should stop validation when the action is invalid", () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            input.action = "INVALID_ACTION";
            input.resource = "INVALID_RESOURCE";
            input.status = "INVALID_STATUS";

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith("Invalid audit action: INVALID_ACTION");

            expect(createAuditEventOhsUseCase.execute).not.toHaveBeenCalled();
        });

        it("should validate the resource before the status", () => {
            const { auditRecorder, createAuditEventOhsUseCase } = makeSut();

            const input = makeInput();
            input.resource = "INVALID_RESOURCE";
            input.status = "INVALID_STATUS";

            const loggerSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});

            auditRecorder.record(input);

            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith("Invalid audit resource: INVALID_RESOURCE");

            expect(createAuditEventOhsUseCase.execute).not.toHaveBeenCalled();
        });
    });
});
