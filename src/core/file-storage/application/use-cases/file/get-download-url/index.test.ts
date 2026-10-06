import { env } from "@/config/index";

import { File } from "../../../../domain/entities";
import { FileNotFoundError, InvalidFileStatusError } from "../../../../domain/errors";
import { FileVersion } from "../../../../domain/value-objects";
import { FileRepositorySpy, FileStoragePortSpy } from "../../../../test-doubles";
import { GetDownloadUrlUseCase } from "./index";

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

describe("GetDownloadUrlUseCase", () => {
    const makeSut = () => {
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const useCase = new GetDownloadUrlUseCase(fileRepository, storagePort);
        return { useCase, fileRepository, storagePort };
    };

    it("should return a signed download URL successfully when file is ready", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(false);
        jest.spyOn(mockFile, "isInfected").mockReturnValue(false);
        jest.spyOn(mockFile, "isReady").mockReturnValue(true);
        const signedUrl = "https://storage.example.com/signed-url";
        fileRepository.findById.mockResolvedValue(mockFile);
        storagePort.getSignedUrl.mockResolvedValue(signedUrl);
        const result = await useCase.execute("file-id");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(storagePort.getSignedUrl).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).toHaveBeenCalledWith(
            "files/file-id/v1/document.pdf",
            env.STORAGE_SIGNED_URL_TTL_SECONDS,
        );
        expect(result).toEqual({
            url: signedUrl,
            expiresIn: env.STORAGE_SIGNED_URL_TTL_SECONDS,
            name: mockFile.name,
            mimeType: mockFile.mimeType,
            size: mockFile.size,
        });
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute("file-id")).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith("file-id");
        expect(storagePort.getSignedUrl).not.toHaveBeenCalled();
    });

    it("should throw FileNotFoundError when file is deleted", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(true);
        fileRepository.findById.mockResolvedValue(mockFile);
        await expect(useCase.execute("file-id")).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(mockFile.isDeleted).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).not.toHaveBeenCalled();
    });

    it("should throw FileNotFoundError when file is infected", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(false);
        jest.spyOn(mockFile, "isInfected").mockReturnValue(true);
        fileRepository.findById.mockResolvedValue(mockFile);
        await expect(useCase.execute("file-id")).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(mockFile.isDeleted).toHaveBeenCalledTimes(1);
        expect(mockFile.isInfected).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).not.toHaveBeenCalled();
    });

    it("should throw InvalidFileStatusError when file is not ready", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(false);
        jest.spyOn(mockFile, "isInfected").mockReturnValue(false);
        jest.spyOn(mockFile, "isReady").mockReturnValue(false);
        fileRepository.findById.mockResolvedValue(mockFile);
        await expect(useCase.execute("file-id")).rejects.toThrow(InvalidFileStatusError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(mockFile.isReady).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).not.toHaveBeenCalled();
    });

    it("should throw InvalidFileStatusError when file has no latest version", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(false);
        jest.spyOn(mockFile, "isInfected").mockReturnValue(false);
        jest.spyOn(mockFile, "isReady").mockReturnValue(true);
        jest.spyOn(mockFile, "getLatestVersion").mockReturnValue(null);
        fileRepository.findById.mockResolvedValue(mockFile);
        await expect(useCase.execute("file-id")).rejects.toThrow(InvalidFileStatusError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(mockFile.getLatestVersion).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when generating signed URL", async () => {
        const { useCase, fileRepository, storagePort } = makeSut();
        const mockFile = makeFile();
        jest.spyOn(mockFile, "isDeleted").mockReturnValue(false);
        jest.spyOn(mockFile, "isInfected").mockReturnValue(false);
        jest.spyOn(mockFile, "isReady").mockReturnValue(true);
        fileRepository.findById.mockResolvedValue(mockFile);
        storagePort.getSignedUrl.mockRejectedValue(new Error("Storage error"));
        await expect(useCase.execute("file-id")).rejects.toThrow("Storage error");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).toHaveBeenCalledTimes(1);
        expect(storagePort.getSignedUrl).toHaveBeenCalledWith(
            "files/file-id/v1/document.pdf",
            env.STORAGE_SIGNED_URL_TTL_SECONDS,
        );
    });
});
