import { File } from "../../../../domain/entities";
import { FileNotFoundError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import { FileRepositorySpy } from "../../../../test-doubles";
import { DeleteFileUseCase } from "./index";

const makeFile = (): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        storageKey: "files/file-id/v1",
        size: 1024,
        checksum: "checksum",
        createdAt,
    });
    return File.create({
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
        createdAt,
    });
};

describe("DeleteFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const useCase = new DeleteFileUseCase(fileRepository);
        return { useCase, fileRepository };
    };

    it("should delete a file successfully when it exists", async () => {
        const { useCase, fileRepository } = makeSut();
        const mockFile = makeFile();
        fileRepository.findById.mockResolvedValue(mockFile);
        fileRepository.update.mockResolvedValue();
        const deleteSpy = jest.spyOn(mockFile, "delete").mockImplementation(() => {});
        const result = await useCase.execute("file-id");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(mockFile);
        expect(result).toBe("file-id");
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("file-id")).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when finding file", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Database error");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating file", async () => {
        const { useCase, fileRepository } = makeSut();
        const mockFile = makeFile();
        fileRepository.findById.mockResolvedValue(mockFile);
        fileRepository.update.mockRejectedValue(new Error("Database error"));
        const deleteSpy = jest.spyOn(mockFile, "delete").mockImplementation(() => {});
        await expect(useCase.execute("file-id")).rejects.toThrow("Database error");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(deleteSpy).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(mockFile);
    });
});
