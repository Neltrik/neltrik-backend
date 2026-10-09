import { type JobScheduler } from "@/shared/jobs";

import { File } from "../../../../domain/entities";
import { FileNotFoundError, FileQuotaExceededError, InvalidFileStatusError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import {
    ChecksumGeneratorSpy,
    FileQuotaRepositorySpy,
    FileRepositorySpy,
    FileStoragePortSpy,
    TransactionManagerSpy,
} from "../../../../test-doubles";
import { CompensatingOperationService } from "../../../compensation";
import { IncrementQuotaInternalUseCase, VerifyQuotaLimitInternalUseCase } from "../../../use-cases-internal";
import { FileValidationService } from "../../../validation";
import { ReplaceFileUseCase } from "./index";
import type { ReplaceFileInput } from "./input";

const makeInput = (): ReplaceFileInput => ({
    fileId: "file-id",
    name: "document-v2.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 2048,
    buffer: Buffer.from("new-file-content"),
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

describe("ReplaceFileUseCase", () => {
    const makeSut = () => {
        const transactionManager = new TransactionManagerSpy();
        const checksumGenerator = new ChecksumGeneratorSpy();
        checksumGenerator.generate.mockResolvedValue("new-checksum");
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const verifyQuotaLimitInternalUseCase = new VerifyQuotaLimitInternalUseCase(fileQuotaRepository);
        const verifyQuotaLimitSpy = jest.spyOn(verifyQuotaLimitInternalUseCase, "execute");
        verifyQuotaLimitSpy.mockResolvedValue(true);
        const incrementQuotaInternalUseCase = new IncrementQuotaInternalUseCase(fileQuotaRepository);
        const incrementQuotaSpy = jest.spyOn(incrementQuotaInternalUseCase, "execute");
        incrementQuotaSpy.mockResolvedValue(undefined as never);
        const magicBytesDetector = {
            detect: jest.fn().mockResolvedValue("application/pdf"),
        };
        const fileValidationService = new FileValidationService(magicBytesDetector);
        jest.spyOn(fileValidationService, "validate").mockResolvedValue(undefined);
        const compensatingOperation = new CompensatingOperationService();
        const jobScheduler = {
            enqueue: jest.fn().mockResolvedValue(undefined),
        } as unknown as JobScheduler;
        const useCase = new ReplaceFileUseCase(
            jobScheduler,
            transactionManager,
            checksumGenerator,
            fileRepository,
            storagePort,
            compensatingOperation,
            incrementQuotaInternalUseCase,
            verifyQuotaLimitInternalUseCase,
            fileValidationService,
        );
        return {
            useCase,
            transactionManager,
            checksumGenerator,
            fileRepository,
            storagePort,
            verifyQuotaLimitSpy,
            incrementQuotaSpy,
            fileValidationService,
            jobScheduler,
        };
    };

    it("should replace the file successfully", async () => {
        const { useCase, fileRepository, storagePort, transactionManager } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        const result = await useCase.execute(makeInput());
        expect(storagePort.upload).toHaveBeenCalledWith(
            "tenants/tenant-id/files/file-id/v2/document-v2.pdf",
            Buffer.from("new-file-content"),
            "application/pdf",
        );
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(transactionManager.executeCalls).toBe(1);
        expect(result).toMatchObject({
            id: "file-id",
            tenantId: "tenant-id",
            ownerId: "owner-id",
            name: "document-v2.pdf",
            status: "PENDING",
        });
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository, storagePort, transactionManager } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(storagePort.upload).not.toHaveBeenCalled();
        expect(transactionManager.executeCalls).toBe(0);
    });

    it("should throw InvalidFileStatusError when file is pending", async () => {
        const { useCase, fileRepository, storagePort, transactionManager } = makeSut();
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
            versions: [
                FileVersion.createInitial({
                    storageKey: "tenants/tenant-id/files/file-id/v1/document.pdf",
                    size: 1024,
                    checksum: "checksum-123",
                    createdAt: new Date("2025-01-01T00:00:00.000Z"),
                    name: "document.pdf",
                    extension: "pdf",
                    mimeType: "application/pdf",
                }),
            ],
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
        });
        fileRepository.findById.mockResolvedValue(file);
        await expect(useCase.execute(makeInput())).rejects.toThrow(InvalidFileStatusError);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(storagePort.upload).not.toHaveBeenCalled();
        expect(transactionManager.executeCalls).toBe(0);
    });

    it("should throw FileQuotaExceededError when quota cannot accommodate the file", async () => {
        const { useCase, fileRepository, verifyQuotaLimitSpy, storagePort } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        verifyQuotaLimitSpy.mockResolvedValue(false);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaExceededError);
        expect(storagePort.upload).not.toHaveBeenCalled();
    });

    it("should pass the correct data to the file validator", async () => {
        const { useCase, fileRepository, fileValidationService } = makeSut();
        const file = makeFile();
        const input = makeInput();
        fileRepository.findById.mockResolvedValue(file);
        await useCase.execute(input);
        expect(fileValidationService.validate).toHaveBeenCalledWith({
            purpose: "DOCUMENT",
            mimeType: input.mimeType,
            extension: input.extension,
            size: input.size,
            buffer: input.buffer,
        });
    });

    it("should increment the quota inside the transaction", async () => {
        const { useCase, fileRepository, incrementQuotaSpy, transactionManager } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        await useCase.execute(makeInput());
        expect(transactionManager.executeCalls).toBe(1);
        expect(incrementQuotaSpy).toHaveBeenCalledWith({ tenantId: "tenant-id", size: 2048 }, expect.anything());
    });

    it("should propagate validation errors", async () => {
        const { useCase, fileRepository, fileValidationService, storagePort } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        jest.spyOn(fileValidationService, "validate").mockRejectedValue(new Error("Invalid file"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Invalid file");
        expect(storagePort.upload).not.toHaveBeenCalled();
    });

    it("should propagate antivirus scheduling errors", async () => {
        const { useCase, fileRepository, storagePort, jobScheduler } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        jest.spyOn(jobScheduler, "enqueue").mockRejectedValue(new Error("Antivirus unavailable"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Antivirus unavailable");
        expect(storagePort.upload).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(jobScheduler.enqueue).toHaveBeenCalledTimes(1);
    });

    it("should use the next version in the storage key", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        await useCase.execute(makeInput());
        expect(storagePort.upload).toHaveBeenCalledWith(
            "tenants/tenant-id/files/file-id/v2/document-v2.pdf",
            Buffer.from("new-file-content"),
            "application/pdf",
        );
    });

    it("should throw InvalidFileStatusError when the file has no latest version", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const file = makeFile();
        jest.spyOn(file, "getLatestVersion").mockReturnValue(null);
        fileRepository.findById.mockResolvedValue(file);
        await expect(useCase.execute(makeInput())).rejects.toThrow(InvalidFileStatusError);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(storagePort.upload).not.toHaveBeenCalled();
    });
});
