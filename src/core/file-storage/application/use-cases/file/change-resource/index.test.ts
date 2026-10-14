import { File } from "../../../../domain/entities";
import { FileAlreadyExistsError, FileNotFoundError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import { FileRepositorySpy } from "../../../../test-doubles";
import { ChangeFileResourceUseCase } from "./index";
import type { ChangeFileResourceInput } from "./input";

const makeFile = (id = "file-id"): File => {
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
        status: "READY",
        resourceType: "USER",
        resourceId: "resource-id",
        versions: [version],
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    });
};

const makeInput = (): ChangeFileResourceInput => ({
    fileId: "file-id",
    resourceType: "PROJECT",
    resourceId: "project-id",
});

describe("ChangeFileResourceUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const useCase = new ChangeFileResourceUseCase(fileRepository);
        return { useCase, fileRepository };
    };

    it("should change the file resource successfully", async () => {
        const { useCase, fileRepository } = makeSut();
        const file = makeFile();
        fileRepository.findById.mockResolvedValue(file);
        fileRepository.findByResourceAndPurpose.mockResolvedValue(null);
        const result = await useCase.execute(makeInput());
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(fileRepository.findByResourceAndPurpose).toHaveBeenCalledWith(
            "tenant-id",
            "PROJECT",
            "project-id",
            file.purpose,
        );
        expect(file.resourceType).toBe("PROJECT");
        expect(file.resourceId).toBe("project-id");
        expect(fileRepository.update).toHaveBeenCalledWith(file);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(result).toBe(file);
    });

    it("should throw FileNotFoundError when the file does not exist", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findByResourceAndPurpose).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should throw FileAlreadyExistsError when another file uses the same resource and purpose", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        fileRepository.findByResourceAndPurpose.mockResolvedValue(makeFile("another-file-id"));
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileAlreadyExistsError);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should allow the resource when the existing file is the same file", async () => {
        const { useCase, fileRepository } = makeSut();
        const file = makeFile();
        fileRepository.findById.mockResolvedValue(file);
        fileRepository.findByResourceAndPurpose.mockResolvedValue(file);
        const result = await useCase.execute(makeInput());
        expect(result).toBe(file);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
    });

    it("should propagate errors when finding the file fails", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findByResourceAndPurpose).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors when checking for an existing resource fails", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        fileRepository.findByResourceAndPurpose.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate errors when updating the file fails", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(makeFile());
        fileRepository.findByResourceAndPurpose.mockResolvedValue(null);
        fileRepository.update.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });
});
