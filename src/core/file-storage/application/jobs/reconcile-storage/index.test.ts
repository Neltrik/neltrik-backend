import { File } from "../../../domain/entities";
import { FileVersion } from "../../../domain/value-objects";
import { FileRepositorySpy, FileStoragePortSpy } from "../../../test-doubles";
import { ReconcileStorageJobsUseCase } from "./index";

const makeFile = (options?: { id?: string; storageKeys?: string[]; deletedAt?: Date | null }): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const storageKeys = options?.storageKeys ?? ["files/file-id/v1/document.pdf"];
    const versions = storageKeys.map((storageKey, index) =>
        FileVersion.createInitial({
            name: `document${index === 0 ? "" : `-${index + 1}`}`,
            extension: "pdf",
            mimeType: "application/pdf",
            storageKey,
            size: 1024,
            checksum: `checksum-${index + 1}`,
            createdAt,
        }),
    );
    return File.restore({
        id: options?.id ?? "file-id",
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: "DOCUMENT",
        resourceType: "USER",
        resourceId: "resource-id",
        versions,
        status: "READY",
        createdAt,
        updatedAt: createdAt,
        deletedAt: options?.deletedAt ?? null,
    });
};

const makeInput = () => ({ tenantId: "tenant-id", dryRun: false });

describe("ReconcileStorageJobsUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const useCase = new ReconcileStorageJobsUseCase(fileRepository, storagePort);
        const file = makeFile();
        const input = makeInput();
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([file]);
        jest.spyOn(fileRepository, "update").mockResolvedValue(undefined);
        jest.spyOn(storagePort, "list").mockResolvedValue(["files/file-id/v1/document.pdf"]);
        jest.spyOn(storagePort, "delete").mockResolvedValue(undefined);
        return { useCase, fileRepository, storagePort, file, input };
    };

    it("should reconcile storage successfully when there are no orphaned binaries or files", async () => {
        const { useCase, fileRepository, storagePort, file, input } = makeSut();
        await expect(useCase.execute(input)).resolves.toBeUndefined();
        expect(fileRepository.findAllByTenant).toHaveBeenCalledTimes(1);
        expect(fileRepository.findAllByTenant).toHaveBeenCalledWith(input.tenantId);
        expect(storagePort.list).toHaveBeenCalledTimes(1);
        expect(storagePort.list).toHaveBeenCalledWith("tenants/tenant-id/files/");
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(file.isDeleted()).toBe(false);
    });

    it("should delete orphaned binaries that do not exist in the database", async () => {
        const { useCase, storagePort, fileRepository } = makeSut();
        jest.spyOn(storagePort, "list").mockResolvedValue([
            "files/file-id/v1/document.pdf",
            "tenants/tenant-id/files/orphan-1.pdf",
            "tenants/tenant-id/files/orphan-2.pdf",
        ]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.delete).toHaveBeenCalledTimes(2);
        expect(storagePort.delete).toHaveBeenNthCalledWith(1, "tenants/tenant-id/files/orphan-1.pdf");
        expect(storagePort.delete).toHaveBeenNthCalledWith(2, "tenants/tenant-id/files/orphan-2.pdf");
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should mark files as orphaned when none of their versions exist in storage", async () => {
        const { useCase, fileRepository, storagePort, file } = makeSut();
        jest.spyOn(storagePort, "list").mockResolvedValue([]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should not mark a file as orphaned when at least one version exists in storage", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const secondVersionKey = "files/file-id/v2/document.pdf";
        const fileWithMultipleVersions = makeFile({
            storageKeys: ["files/file-id/v1/document.pdf", secondVersionKey],
        });
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([fileWithMultipleVersions]);
        jest.spyOn(storagePort, "list").mockResolvedValue([secondVersionKey]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should delete a binary even when another version of the same file exists in storage", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const file = makeFile({
            storageKeys: ["files/file-id/v1/document.pdf", "files/file-id/v2/document.pdf"],
        });
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([file]);
        jest.spyOn(storagePort, "list").mockResolvedValue([
            "files/file-id/v2/document.pdf",
            "tenants/tenant-id/files/orphan.pdf",
        ]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.delete).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).toHaveBeenCalledWith("tenants/tenant-id/files/orphan.pdf");
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should not mark deleted files as orphaned", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const deletedFile = makeFile();
        deletedFile.delete();
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([deletedFile]);
        jest.spyOn(storagePort, "list").mockResolvedValue([]);
        expect(deletedFile.isDeleted()).toBe(true);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should not delete binaries or update files when dryRun is enabled", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(storagePort, "list").mockResolvedValue(["tenants/tenant-id/files/orphan.pdf"]);
        await expect(useCase.execute({ ...makeInput(), dryRun: true })).resolves.toBeUndefined();
        expect(fileRepository.findAllByTenant).toHaveBeenCalledTimes(1);
        expect(storagePort.list).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should not delete binaries that belong to any file version in the database", async () => {
        const { useCase, storagePort, fileRepository } = makeSut();
        jest.spyOn(storagePort, "list").mockResolvedValue(["files/file-id/v1/document.pdf"]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should reconcile storage when the tenant has no files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([]);
        jest.spyOn(storagePort, "list").mockResolvedValue([
            "tenants/tenant-id/files/orphan-1.pdf",
            "tenants/tenant-id/files/orphan-2.pdf",
        ]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.delete).toHaveBeenCalledTimes(2);
        expect(storagePort.delete).toHaveBeenNthCalledWith(1, "tenants/tenant-id/files/orphan-1.pdf");
        expect(storagePort.delete).toHaveBeenNthCalledWith(2, "tenants/tenant-id/files/orphan-2.pdf");
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when finding files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(fileRepository, "findAllByTenant").mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findAllByTenant).toHaveBeenCalledTimes(1);
        expect(storagePort.list).not.toHaveBeenCalled();
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when listing binaries", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(storagePort, "list").mockRejectedValue(new Error("Storage listing failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage listing failed");
        expect(fileRepository.findAllByTenant).toHaveBeenCalledTimes(1);
        expect(storagePort.list).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when deleting orphaned binaries", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(storagePort, "list").mockResolvedValue(["tenants/tenant-id/files/orphan.pdf"]);
        jest.spyOn(storagePort, "delete").mockRejectedValue(new Error("Storage deletion failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage deletion failed");
        expect(storagePort.delete).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when updating orphaned files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const file = makeFile();
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([file]);
        jest.spyOn(storagePort, "list").mockResolvedValue([]);
        jest.spyOn(fileRepository, "update").mockRejectedValue(new Error("File update failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("File update failed");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
    });

    it("should delete orphaned binaries before updating orphaned files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const file = makeFile();
        jest.spyOn(fileRepository, "findAllByTenant").mockResolvedValue([file]);
        jest.spyOn(storagePort, "list").mockResolvedValue(["tenants/tenant-id/files/orphan.pdf"]);
        const executionOrder: string[] = [];
        jest.spyOn(storagePort, "delete").mockImplementation(() => {
            executionOrder.push("delete");
            return Promise.resolve();
        });
        jest.spyOn(fileRepository, "update").mockImplementation(() => {
            executionOrder.push("update");
            return Promise.resolve();
        });
        await useCase.execute(makeInput());
        expect(executionOrder).toEqual(["delete", "update"]);
    });
});
