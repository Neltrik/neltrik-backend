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
        version: 0,
        status: "READY",
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    });
};

const makeFileQuota = (): FileQuota =>
    FileQuota.restore({
        id: "quota-id",
        tenantId: "tenant-id",
        limitBytes: 10_240,
        usedBytes: 2_048,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

describe("DeleteFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const fileQuotaRepository = new FileQuotaRepositorySpy();
        const transactionManager = new TransactionManagerSpy();
        fileRepository.findById.mockResolvedValue(makeFile());
        fileQuotaRepository.findByTenantId.mockResolvedValue(makeFileQuota());
        const decrementQuotaInternalUseCase = new DecrementQuotaInternalUseCase(fileQuotaRepository);
        const decrementQuotaSpy = jest.spyOn(decrementQuotaInternalUseCase, "execute");
        const useCase = new DeleteFileUseCase(transactionManager, fileRepository, decrementQuotaInternalUseCase);
        return { useCase, fileRepository, fileQuotaRepository, transactionManager, decrementQuotaSpy };
    };

    it("should delete a file successfully when it exists", async () => {
        const { useCase, fileRepository, transactionManager, decrementQuotaSpy } = makeSut();
        await expect(useCase.execute("file-id")).resolves.toEqual({ id: "file-id" });
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(decrementQuotaSpy).toHaveBeenCalledTimes(1);
    });

    it("should decrement the file quota using the tenant and total size", async () => {
        const { useCase, decrementQuotaSpy } = makeSut();
        await useCase.execute("file-id");
        expect(decrementQuotaSpy).toHaveBeenCalledWith({ tenantId: "tenant-id", size: 1024 }, expect.anything());
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository, fileQuotaRepository, decrementQuotaSpy } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("file-id")).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(decrementQuotaSpy).not.toHaveBeenCalled();
        expect(fileQuotaRepository.findByTenantId).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when finding the file", async () => {
        const { useCase, fileRepository, decrementQuotaSpy } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Database error");
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(decrementQuotaSpy).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when updating the file", async () => {
        const { useCase, fileRepository, decrementQuotaSpy } = makeSut();
        fileRepository.update.mockRejectedValue(new Error("File update failed"));
        await expect(useCase.execute("file-id")).rejects.toThrow("File update failed");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(decrementQuotaSpy).not.toHaveBeenCalled();
    });

    it("should propagate quota decrement errors", async () => {
        const { useCase, decrementQuotaSpy, fileRepository } = makeSut();
        decrementQuotaSpy.mockRejectedValue(new Error("Quota decrement failed"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Quota decrement failed");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(decrementQuotaSpy).toHaveBeenCalledTimes(1);
    });

    it("should propagate transaction manager errors", async () => {
        const { useCase, fileRepository, decrementQuotaSpy, transactionManager } = makeSut();
        transactionManager.shouldFail = true;
        await expect(useCase.execute("file-id")).rejects.toThrow("Transaction failed");
        expect(transactionManager.executeCalls).toBe(1);
        expect(fileRepository.findById).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(decrementQuotaSpy).not.toHaveBeenCalled();
    });
});
