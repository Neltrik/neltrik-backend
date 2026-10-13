import { Logger } from "@nestjs/common";

import { File } from "../../../domain/entities";
import { FileVersion } from "../../../domain/value-objects";
import { FileRepositorySpy, FileStoragePortSpy } from "../../../test-doubles";
import { PurgeDeletedFilesJobsUseCase } from "./index";

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
        deletedAt: options?.deletedAt ?? new Date("2025-01-01T00:00:00.000Z"),
    });
};

const makeInput = () => ({ tenantId: "tenant-id", graceDays: 30, dryRun: false });

describe("PurgeDeletedFilesJobsUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const useCase = new PurgeDeletedFilesJobsUseCase(fileRepository, storagePort);
        const file = makeFile();
        const input = makeInput();
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([file]);
        jest.spyOn(storagePort, "list").mockResolvedValue(["files/file-id/v1/document.pdf"]);
        jest.spyOn(storagePort, "delete").mockResolvedValue(undefined);
        return { useCase, fileRepository, storagePort, file, input };
    };

    it("should purge deleted files successfully", async () => {
        const { useCase, fileRepository, storagePort, input } = makeSut();
        await expect(useCase.execute(input)).resolves.toBeUndefined();
        expect(fileRepository.findDeletedBefore).toHaveBeenCalledTimes(1);
        expect(fileRepository.findDeletedBefore).toHaveBeenCalledWith(input.tenantId, expect.any(Date));
        expect(storagePort.list).toHaveBeenCalledTimes(1);
        expect(storagePort.list).toHaveBeenCalledWith("tenants/tenant-id/files/");
        expect(storagePort.delete).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).toHaveBeenCalledWith("files/file-id/v1/document.pdf");
    });

    it("should use the configured grace period to find deleted files", async () => {
        const { useCase, fileRepository } = makeSut();
        const now = Date.now();
        const graceDays = 15;
        const input = { ...makeInput(), graceDays };
        jest.spyOn(Date, "now").mockReturnValue(now);
        await useCase.execute(input);
        expect(fileRepository.findDeletedBefore).toHaveBeenCalledWith(
            input.tenantId,
            new Date(now - graceDays * 24 * 60 * 60 * 1000),
        );
    });

    it("should not delete binaries when dryRun is enabled", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        await expect(useCase.execute({ ...makeInput(), dryRun: true })).resolves.toBeUndefined();
        expect(fileRepository.findDeletedBefore).toHaveBeenCalledTimes(1);
        expect(storagePort.list).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should not delete binaries when none of the file versions exist in storage", async () => {
        const { useCase, storagePort } = makeSut();
        jest.spyOn(storagePort, "list").mockResolvedValue([]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should not process files when none of their versions exist in storage", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();

        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([
            makeFile({
                storageKeys: ["files/file-id/v1/document.pdf", "files/file-id/v2/document.pdf"],
            }),
        ]);
        jest.spyOn(storagePort, "list").mockResolvedValue(["files/another-file/document.pdf"]);
        const loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
        await useCase.execute(makeInput());
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining("0 files, 0 binaries deleted (0) (dryRun: false)"),
        );
        loggerSpy.mockRestore();
    });

    it("should delete all versions when at least one version exists in storage", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const file = makeFile({
            storageKeys: ["files/file-id/v1/document.pdf", "files/file-id/v2/document.pdf"],
        });
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([file]);
        jest.spyOn(storagePort, "list").mockResolvedValue(["files/file-id/v2/document.pdf"]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.delete).toHaveBeenCalledTimes(2);
        expect(storagePort.delete).toHaveBeenNthCalledWith(1, "files/file-id/v1/document.pdf");
        expect(storagePort.delete).toHaveBeenNthCalledWith(2, "files/file-id/v2/document.pdf");
    });

    it("should delete versions from multiple eligible files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const firstFile = makeFile({ id: "file-1", storageKeys: ["files/file-1/v1/document.pdf"] });
        const secondFile = makeFile({
            id: "file-2",
            storageKeys: ["files/file-2/v1/document.pdf", "files/file-2/v2/document.pdf"],
        });
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([firstFile, secondFile]);
        jest.spyOn(storagePort, "list").mockResolvedValue([
            "files/file-1/v1/document.pdf",
            "files/file-2/v1/document.pdf",
        ]);
        await useCase.execute(makeInput());
        expect(storagePort.delete).toHaveBeenCalledTimes(3);
        expect(storagePort.delete).toHaveBeenNthCalledWith(1, "files/file-1/v1/document.pdf");
        expect(storagePort.delete).toHaveBeenNthCalledWith(2, "files/file-2/v1/document.pdf");
        expect(storagePort.delete).toHaveBeenNthCalledWith(3, "files/file-2/v2/document.pdf");
    });

    it("should log the number of files and binaries that would be deleted in dryRun mode", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const file = makeFile({
            storageKeys: ["files/file-id/v1/document.pdf", "files/file-id/v2/document.pdf"],
        });
        const loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([file]);
        jest.spyOn(storagePort, "list").mockResolvedValue(["files/file-id/v1/document.pdf"]);
        await useCase.execute({ ...makeInput(), dryRun: true });
        expect(storagePort.delete).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining("Tenant tenant-id: 1 files, 2 binaries would be deleted (dryRun: true)"),
        );
        loggerSpy.mockRestore();
    });

    it("should log the number of successfully deleted binaries", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([
            makeFile({
                storageKeys: ["files/file-id/v1/document.pdf", "files/file-id/v2/document.pdf"],
            }),
        ]);
        jest.spyOn(storagePort, "list").mockResolvedValue([
            "files/file-id/v1/document.pdf",
            "files/file-id/v2/document.pdf",
        ]);
        await useCase.execute(makeInput());
        expect(storagePort.delete).toHaveBeenCalledTimes(2);
        expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining("Tenant tenant-id: 1 files, 2 binaries deleted (2) (dryRun: false)"),
        );
        loggerSpy.mockRestore();
    });

    it("should not process any files when the tenant has no deleted files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.list).toHaveBeenCalledWith("tenants/tenant-id/files/");
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding deleted files", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(fileRepository, "findDeletedBefore").mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findDeletedBefore).toHaveBeenCalledTimes(1);
        expect(storagePort.list).not.toHaveBeenCalled();
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when listing binaries", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(storagePort, "list").mockRejectedValue(new Error("Storage listing failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage listing failed");
        expect(fileRepository.findDeletedBefore).toHaveBeenCalledTimes(1);
        expect(storagePort.list).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when deleting binaries", async () => {
        const { useCase, storagePort } = makeSut();
        jest.spyOn(storagePort, "delete").mockRejectedValue(new Error("Storage deletion failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage deletion failed");
        expect(storagePort.delete).toHaveBeenCalledTimes(1);
    });

    it("should stop deleting subsequent binaries when a deletion fails", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        jest.spyOn(fileRepository, "findDeletedBefore").mockResolvedValue([
            makeFile({
                storageKeys: ["files/file-id/v1/document.pdf", "files/file-id/v2/document.pdf"],
            }),
        ]);
        jest.spyOn(storagePort, "list").mockResolvedValue([
            "files/file-id/v1/document.pdf",
            "files/file-id/v2/document.pdf",
        ]);
        jest.spyOn(storagePort, "delete").mockRejectedValueOnce(new Error("Storage deletion failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage deletion failed");
        expect(storagePort.delete).toHaveBeenCalledTimes(1);
        expect(storagePort.delete).toHaveBeenCalledWith("files/file-id/v1/document.pdf");
    });
});
