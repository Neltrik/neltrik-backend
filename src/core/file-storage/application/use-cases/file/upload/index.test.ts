import type { IdGenerator } from "@/shared/id-generator";
import type { OutboxRepository } from "@/shared/outbox";

import { File } from "../../../../domain/entities";
import { FileAlreadyExistsError, FileQuotaExceededError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import {
    ChecksumGeneratorSpy,
    FileQuotaRepositorySpy,
    FileRepositorySpy,
    FileStoragePortSpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { CompensatingOperationService } from "../../../compensation";
import {
    CreateOrGetQuotaInternalUseCase,
    IncrementQuotaInternalUseCase,
    VerifyQuotaLimitInternalUseCase,
} from "../../../use-cases-internal";
import { FileValidationService } from "../../../validation";
import { UploadFileUseCase } from "./index";
import type { UploadFileInput } from "./input";

const makeInput = (): UploadFileInput => ({
    tenantId: "tenant-id",
    ownerId: "owner-id",
    name: "document.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 1024,
    purpose: "DOCUMENT",
    resourceType: "USER",
    resourceId: "resource-id",
    buffer: Buffer.from("file-content"),
});

const makeFile = (): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        storageKey: "tenants/tenant-id/files/file-id/v1/document.pdf",
        size: 1024,
        checksum: "checksum-123",
        createdAt,
        name: "document.pdf",
        extension: "pdf",
        mimeType: "application/pdf",
    });
    const file = File.create({
        id: "file-id",
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: "document.pdf",
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: "DOCUMENT",
        resourceType: "USER",
        resourceId: "resource-id",
        versions: [version],
        createdAt,
    });
    file.markReady();
    return file;
};

describe("UploadFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const outboxRepository: jest.Mocked<OutboxRepository> = {
            create: jest.fn().mockResolvedValue(undefined),
            findPending: jest.fn().mockResolvedValue([]),
            markProcessed: jest.fn().mockResolvedValue(undefined),
            markFailed: jest.fn().mockResolvedValue(undefined),
        };
        const checksumGenerator = new ChecksumGeneratorSpy();
        checksumGenerator.generate.mockResolvedValue("checksum-123");
        const fileValidationService = new FileValidationService({
            detect: jest.fn().mockResolvedValue("application/pdf"),
        });
        jest.spyOn(fileValidationService, "validate").mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("file-id");
        const idGenerator = { generate: generateMock } satisfies IdGenerator;
        const quotaRepository = new FileQuotaRepositorySpy();
        const verifyQuota = new VerifyQuotaLimitInternalUseCase(quotaRepository);
        const verifyQuotaSpy = jest.spyOn(verifyQuota, "execute").mockResolvedValue(true);
        const createQuota = new CreateOrGetQuotaInternalUseCase(idGenerator, quotaRepository);
        const incrementQuota = new IncrementQuotaInternalUseCase(quotaRepository);
        const incrementQuotaSpy = jest.spyOn(incrementQuota, "execute").mockResolvedValue(undefined as never);
        const transactionManager = new TransactionManagerSpy();
        const useCase = new UploadFileUseCase(
            idGenerator,
            outboxRepository,
            transactionManager,
            checksumGenerator,
            fileRepository,
            storagePort,
            new CompensatingOperationService(),
            createQuota,
            incrementQuota,
            verifyQuota,
            fileValidationService,
        );
        return {
            useCase,
            fileRepository,
            storagePort,
            outboxRepository,
            fileValidationService,
            verifyQuotaSpy,
            incrementQuotaSpy,
            generateMock,
            transactionManager,
        };
    };

    it("should upload a file successfully", async () => {
        const { useCase, fileRepository, storagePort, generateMock, transactionManager } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(generateMock).toHaveBeenCalledTimes(2);
        expect(storagePort.upload).toHaveBeenCalledWith(
            "tenants/tenant-id/files/file-id/v1/document.pdf",
            Buffer.from("file-content"),
            "application/pdf",
        );
        expect(fileRepository.create).toHaveBeenCalledTimes(1);
        expect(transactionManager.executeCalls).toBe(1);
        expect(result).toMatchObject({
            id: "file-id",
            tenantId: "tenant-id",
            ownerId: "owner-id",
            name: "document.pdf",
            status: "PENDING",
        });
    });

    it("should throw FileAlreadyExistsError when the file already exists", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        fileRepository.findByResourceAndPurpose.mockResolvedValue(makeFile());
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileAlreadyExistsError);
        expect(storagePort.upload).not.toHaveBeenCalled();
    });

    it("should throw FileQuotaExceededError when quota cannot accommodate the file", async () => {
        const { useCase, verifyQuotaSpy, storagePort } = makeSut();
        verifyQuotaSpy.mockResolvedValue(false);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaExceededError);
        expect(storagePort.upload).not.toHaveBeenCalled();
    });

    it("should create the file with the generated id", async () => {
        const { useCase, fileRepository, generateMock } = makeSut();
        generateMock.mockReturnValue("generated-file-id");
        await useCase.execute(makeInput());
        expect(fileRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "generated-file-id",
                tenantId: "tenant-id",
                ownerId: "owner-id",
                name: "document.pdf",
                purpose: "DOCUMENT",
            }),
            expect.anything(),
        );
    });

    it("should pass the correct data to the file validator", async () => {
        const { useCase, fileValidationService } = makeSut();
        const input = makeInput();
        await useCase.execute(input);
        expect(fileValidationService.validate).toHaveBeenCalledWith({
            purpose: input.purpose,
            mimeType: input.mimeType,
            extension: input.extension,
            size: input.size,
            buffer: input.buffer,
        });
    });

    it("should increment the quota inside the transaction", async () => {
        const { useCase, incrementQuotaSpy, transactionManager } = makeSut();
        await useCase.execute(makeInput());
        expect(transactionManager.executeCalls).toBe(1);
        expect(incrementQuotaSpy).toHaveBeenCalledWith({ tenantId: "tenant-id", size: 1024 }, expect.anything());
    });

    it("should propagate validation errors", async () => {
        const { useCase, fileValidationService, storagePort } = makeSut();
        jest.spyOn(fileValidationService, "validate").mockRejectedValue(new Error("Invalid file"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Invalid file");
        expect(storagePort.upload).not.toHaveBeenCalled();
    });

    it("should create a FILE_SCAN outbox event", async () => {
        const { useCase, outboxRepository } = makeSut();
        await useCase.execute(makeInput());
        expect(outboxRepository.create).toHaveBeenCalledWith(
            { eventType: "FILE_SCAN", payload: { tenantId: "tenant-id", fileId: "file-id", version: 1 } },
            expect.anything(),
        );
    });

    it("should propagate outbox errors and compensate the uploaded file", async () => {
        const { useCase, outboxRepository, storagePort } = makeSut();
        outboxRepository.create.mockRejectedValue(new Error("Outbox unavailable"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Outbox unavailable");
        expect(storagePort.upload).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).toHaveBeenCalledWith("tenants/tenant-id/files/file-id/v1/document.pdf");
    });
});
