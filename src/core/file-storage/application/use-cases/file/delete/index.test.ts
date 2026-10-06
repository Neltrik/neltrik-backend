import { File, FileQuota } from "../../../../domain/entities";
import { FileNotFoundError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import { FileQuotaRepositorySpy, FileRepositorySpy, TransactionManagerSpy } from "../../../../test-doubles";
import { DecrementQuotaInternalUseCase } from "../../../use-cases-internal";
import { DeleteFileUseCase } from "./index";

const makeFile = (): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        storageKey: "files/file-id/v1/document.pdf",
        size: 1024,
        checksum: "checksum",
        createdAt,
    });
    return File.restore({
        id: "file-id",
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: "DOCUMENT",
        resourceType: "USER",
        resourceId: "resource-id",
        versions: [version],
        status: "READY",
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    });
};

const makeFileQuota = (): FileQuota => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    return FileQuota.restore({
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_240,
        usedBytes: 2_048,
        createdAt,
        updatedAt: createdAt,
    });
};

describe("DeleteFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const transactionManager = new TransactionManagerSpy();
        const decrementQuotaInternalUseCase = new DecrementQuotaInternalUseCase(fileQuotaRepository);
        const useCase = new DeleteFileUseCase(transactionManager, fileRepository, decrementQuotaInternalUseCase);
        const file = makeFile();
        const quota = makeFileQuota();
        fileRepository.findById.mockResolvedValue(file);
        fileRepository.update.mockResolvedValue();
        fileQuotaRepository.findByTenantId.mockResolvedValue(quota);
        fileQuotaRepository.update.mockResolvedValue();
        return { useCase, fileRepository, fileQuotaRepository, transactionManager, file, quota };
    };

    it("should delete a file successfully when it exists", async () => {
        const { useCase, fileRepository, fileQuotaRepository, transactionManager } = makeSut();
        await expect(useCase.execute("file-id")).resolves.toEqual({ id: "file-id" });
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should decrement the file quota when the file is deleted", async () => {
        const { useCase, fileQuotaRepository, quota } = makeSut();
        await useCase.execute("file-id");
        expect(quota.usedBytes).toBe(1_024);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledWith(quota, expect.anything());
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository, fileQuotaRepository, transactionManager } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("file-id")).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when finding the file", async () => {
        const { useCase, fileRepository, fileQuotaRepository, transactionManager } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Database error");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when updating the file", async () => {
        const { useCase, fileRepository, fileQuotaRepository, transactionManager } = makeSut();
        fileRepository.update.mockRejectedValue(new Error("File update failed"));
        await expect(useCase.execute("file-id")).rejects.toThrow("File update failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate quota repository errors when finding the quota", async () => {
        const { useCase, fileQuotaRepository, transactionManager } = makeSut();
        fileQuotaRepository.findByTenantId.mockRejectedValue(new Error("Quota lookup failed"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Quota lookup failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledWith("tenant-id");
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate quota repository errors when updating the quota", async () => {
        const { useCase, fileQuotaRepository, transactionManager } = makeSut();
        fileQuotaRepository.update.mockRejectedValue(new Error("Quota update failed"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Quota update failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileQuotaRepository.findByTenantId).toHaveBeenCalledTimes(1);
        expect(fileQuotaRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should propagate transaction manager errors", async () => {
        const { useCase, fileRepository, fileQuotaRepository, transactionManager } = makeSut();
        transactionManager.shouldFail = true;
        await expect(useCase.execute("file-id")).rejects.toThrow("Transaction failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.findById).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
        expect(fileQuotaRepository.update).not.toHaveBeenCalled();
    });
});
