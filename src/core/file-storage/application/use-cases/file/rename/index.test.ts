import { File } from "../../../../domain/entities";
import { FileNotFoundError, FileNotReadyError } from "../../../../domain/errors";
import { FILE_STATUS, type FileStatus } from "../../../../domain/types";
import { FileVersion } from "../../../../domain/value-objects";
import { FileRepositorySpy } from "../../../../test-doubles";
import { RenameFileUseCase } from "./index";
import type { RenameFileInput } from "./input";

const makeFile = (id = "file-id", status: FileStatus = FILE_STATUS.READY): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        storageKey: `files/${id}/v1`,
        size: 1024,
        checksum: `checksum-${id}`,
        createdAt,
        name: `document-${id}`,
        extension: "pdf",
        mimeType: "application/pdf",
    });
    return File.restore({
        id,
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: `document-${id}`,
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: "DOCUMENT",
        status,
        resourceType: "USER",
        resourceId: "resource-id",
        versions: [version],
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    });
};
const makeInput = (): RenameFileInput => ({ fileId: "file-id", name: "renamed-document" });

describe("RenameFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const useCase = new RenameFileUseCase(fileRepository);
        return { useCase, fileRepository };
    };

    it("should rename a file successfully", async () => {
        const { useCase, fileRepository } = makeSut();
        const file = makeFile();
        fileRepository.findById.mockResolvedValue(file);
        const result = await useCase.execute(makeInput());
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(file.name).toBe("renamed-document");
        expect(fileRepository.update).toHaveBeenCalledWith(file);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(file);
    });

    it("should throw FileNotFoundError when the file does not exist", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors when finding the file fails", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors when updating the file fails", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        fileRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should propagate domain errors when renaming a pending file", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile("pending-file", FILE_STATUS.PENDING));
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotReadyError);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });
});
