import type { IdGenerator } from "@/shared/id-generator";

import { type File } from "../../../../domain/entities";
import { FileAlreadyExistsError, FileQuotaExceededError } from "../../../../domain/errors";
import { AntivirusScan } from "../../../../domain/value-objects";
import {
    AntivirusPortSpy,
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

describe("UploadFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const checksumGenerator = new ChecksumGeneratorSpy();
        checksumGenerator.generate.mockResolvedValue("checksum-123");
        const antivirusPort = new AntivirusPortSpy();
        antivirusPort.scan.mockResolvedValue(AntivirusScan.clean("stub", new Date()));
        const magicBytesDetector = {
            detect: jest.fn().mockResolvedValue("application/pdf"),
        };
        const fileValidationService = new FileValidationService(magicBytesDetector);
        jest.spyOn(fileValidationService, "validate").mockResolvedValue(undefined);
        const generateMock = jest.fn().mockReturnValue("file-id");
        const idGenerator = {
            generate: generateMock,
        } satisfies IdGenerator;
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const verifyQuotaLimitInternalUseCase = new VerifyQuotaLimitInternalUseCase(fileQuotaRepository);
        const verifyQuotaLimitSpy = jest.spyOn(verifyQuotaLimitInternalUseCase, "execute");
        verifyQuotaLimitSpy.mockResolvedValue(true);
        const createOrGetQuotaInternalUseCase = new CreateOrGetQuotaInternalUseCase(idGenerator, fileQuotaRepository);
        const incrementQuotaInternalUseCase = new IncrementQuotaInternalUseCase(fileQuotaRepository);
        const incrementQuotaSpy = jest.spyOn(incrementQuotaInternalUseCase, "execute");
        incrementQuotaSpy.mockResolvedValue(undefined as never);
        const transactionManager = new TransactionManagerSpy();
        const compensatingOperation = new CompensatingOperationService();
        const useCase = new UploadFileUseCase(
            idGenerator,
            transactionManager,
            antivirusPort,
            checksumGenerator,
            fileRepository,
            storagePort,
            compensatingOperation,
            createOrGetQuotaInternalUseCase,
            incrementQuotaInternalUseCase,
            verifyQuotaLimitInternalUseCase,
            fileValidationService,
        );
        return {
            useCase,
            fileRepository,
            storagePort,
            checksumGenerator,
            antivirusPort,
            fileValidationService,
            verifyQuotaLimitSpy,
            incrementQuotaSpy,
            generateMock,
            transactionManager,
        };
    };

    it("should upload a clean file successfully", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort, generateMock, transactionManager } = makeSut();
        const result = await useCase.execute(makeInput());
        expect(generateMock).toHaveBeenCalledTimes(2);
        expect(storagePort.upload).toHaveBeenCalledWith(
            "tenants/tenant-id/files/file-id/v1/document.pdf",
            Buffer.from("file-content"),
            "application/pdf",
        );
        expect(antivirusPort.scan).toHaveBeenCalledWith(Buffer.from("file-content"));
        expect(fileRepository.create).toHaveBeenCalledTimes(1);
        expect(transactionManager.executeCalls).toBe(1);
        expect(result).toMatchObject({
            id: "file-id",
            tenantId: "tenant-id",
            ownerId: "owner-id",
            name: "document.pdf",
            status: "READY",
        });
    });

    it("should throw FileAlreadyExistsError when the file already exists", async () => {
        const { useCase, fileRepository, storagePort, transactionManager } = makeSut();
        fileRepository.findByResourceAndPurpose.mockResolvedValue({} as File);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileAlreadyExistsError);
        expect(storagePort.upload).not.toHaveBeenCalled();
        expect(transactionManager.executeCalls).toBe(0);
    });

    it("should throw FileQuotaExceededError when quota cannot accommodate the file", async () => {
        const { useCase, verifyQuotaLimitSpy, storagePort, transactionManager } = makeSut();
        verifyQuotaLimitSpy.mockResolvedValue(false);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileQuotaExceededError);
        expect(storagePort.upload).not.toHaveBeenCalled();
        expect(transactionManager.executeCalls).toBe(0);
    });

    it("should create the file with the generated id", async () => {
        const { useCase, fileRepository, generateMock } = makeSut();
        generateMock.mockReturnValue("generated-file-id");
        await useCase.execute(makeInput());
        expect(fileRepository.create).toHaveBeenCalledTimes(1);
        expect(fileRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "generated-file-id",
                tenantId: "tenant-id",
                ownerId: "owner-id",
                name: "document.pdf",
                extension: "pdf",
                mimeType: "application/pdf",
                size: 1024,
                purpose: "DOCUMENT",
                resourceType: "USER",
                resourceId: "resource-id",
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

    it("should propagate antivirus errors", async () => {
        const { useCase, antivirusPort, fileRepository } = makeSut();
        antivirusPort.scan.mockRejectedValue(new Error("Antivirus unavailable"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Antivirus unavailable");
        expect(fileRepository.create).not.toHaveBeenCalled();
    });

    it("should mark the file as infected when antivirus detects a threat", async () => {
        const { useCase, antivirusPort } = makeSut();
        const scan = AntivirusScan.clean("stub", new Date());
        jest.spyOn(scan, "isClean").mockReturnValue(false);
        antivirusPort.scan.mockResolvedValue(scan);
        const result = await useCase.execute(makeInput());
        expect(result.status).toBe("INFECTED");
    });
});
