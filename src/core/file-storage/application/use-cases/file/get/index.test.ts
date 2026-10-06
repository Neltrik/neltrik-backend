import { File } from "../../../../domain/entities";
import { FileNotFoundError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import { FileRepositorySpy } from "../../../../test-doubles";
import { GetFileUseCase } from "./index";

const makeInput = (): string => "file-id";
const makeFile = (): File => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const version = FileVersion.createInitial({
        storageKey: "files/file-id/v1/document.pdf",
        size: 1024,
        checksum: "checksum",
        createdAt,
        name: "document.pdf",
        extension: "pdf",
        mimeType: "application/pdf",
    });
    return File.create({
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
};

describe("GetFileUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const useCase = new GetFileUseCase(fileRepository);
        return { useCase, fileRepository };
    };

    it("should return a file successfully when it exists", async () => {
        const { useCase, fileRepository } = makeSut();
        const mockFile = makeFile();
        fileRepository.findById.mockResolvedValue(mockFile);
        const result = await useCase.execute(makeInput());
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(result).toEqual({
            id: mockFile.id,
            tenantId: mockFile.tenantId,
            ownerId: mockFile.ownerId,
            name: mockFile.name,
            extension: mockFile.extension,
            mimeType: mockFile.mimeType,
            size: mockFile.size,
            purpose: mockFile.purpose,
            status: mockFile.status,
            resourceType: mockFile.resourceType,
            resourceId: mockFile.resourceId,
            createdAt: mockFile.createdAt,
            updatedAt: mockFile.updatedAt,
            deletedAt: mockFile.deletedAt,
        });
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
    });

    it("should throw FileNotFoundError when file is deleted", async () => {
        const { useCase, fileRepository } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(true);
        fileRepository.findById.mockResolvedValue(mockFile);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(mockFile.isDeleted).toHaveBeenCalledTimes(1);
    });

    it("should throw FileNotFoundError when file is infected", async () => {
        const { useCase, fileRepository } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(false);
        jest.spyOn(mockFile, "isInfected").mockReturnValue(true);
        fileRepository.findById.mockResolvedValue(mockFile);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(mockFile.isDeleted).toHaveBeenCalledTimes(1);
        expect(mockFile.isInfected).toHaveBeenCalledTimes(1);
    });

    it("should propagate repository errors when finding file", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
    });
});
