import { File } from "../../../domain/entities";
import { FileNotFoundError, FileVersionNotFoundError } from "../../../domain/errors";
import { AntivirusScan, FileVersion } from "../../../domain/value-objects";
import { AntivirusPortSpy, FileRepositorySpy, FileStoragePortSpy } from "../../../test-doubles";
import { ScanFileJobsUseCase } from "./index";

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
        status: "PENDING",
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    });
};

const makeInput = () => ({ fileId: "file-id", tenantId: "tenant-id", version: 1 });

describe("ScanFileJobsUseCase", () => {
    const makeSut = () => {
        const antivirusPort = new AntivirusPortSpy();
        antivirusPort.scan.mockResolvedValue(AntivirusScan.clean("stub", new Date()));
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const useCase = new ScanFileJobsUseCase(antivirusPort, fileRepository, storagePort);
        const file = makeFile();
        const input = makeInput();
        fileRepository.findById.mockResolvedValue(file);
        fileRepository.update.mockResolvedValue();
        return { useCase, antivirusPort, fileRepository, storagePort, file, input };
    };

    it("should scan a pending file successfully", async () => {
        const { useCase, antivirusPort, fileRepository, storagePort, input, file } = makeSut();
        const buffer = Buffer.from("file-content");
        storagePort.download.mockResolvedValue(buffer);
        await expect(useCase.execute(input)).resolves.toBeUndefined();
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(fileRepository.findById).toHaveBeenCalledWith(input.fileId);
        expect(storagePort.download).toHaveBeenCalledTimes(1);
        expect(storagePort.download).toHaveBeenCalledWith("files/file-id/v1/document.pdf");
        expect(antivirusPort.scan).toHaveBeenCalledTimes(1);
        expect(antivirusPort.scan).toHaveBeenCalledWith(buffer);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
    });

    it("should throw FileNotFoundError when file does not exist", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        fileRepository.findById.mockResolvedValue(null);
        await expect(useCase.execute(makeInput())).rejects.toThrow(FileNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should throw FileNotFoundError when file belongs to another tenant", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        await expect(useCase.execute({ ...makeInput(), tenantId: "another-tenant-id" })).rejects.toThrow(
            FileNotFoundError,
        );
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should not scan a file that is not pending", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort, file } = makeSut();
        file.markReady();
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should throw FileVersionNotFoundError when latest version does not match input version", async () => {
        const { useCase, storagePort, antivirusPort, fileRepository } = makeSut();
        await expect(useCase.execute({ ...makeInput(), version: 2 })).rejects.toThrow(FileVersionNotFoundError);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should not scan a version that already has scans", async () => {
        const { useCase, file, storagePort, antivirusPort, fileRepository } = makeSut();
        const version = file.getLatestVersion();
        if (!version) {
            throw new Error("Expected latest file version");
        }
        const existingScan = { isClean: () => true, isInfected: () => false };
        file.addScanToLatestVersion(existingScan as never);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should mark the file as ready when scan is clean", async () => {
        const { useCase, antivirusPort, fileRepository, file } = makeSut();
        antivirusPort.scan.mockResolvedValue({ isClean: () => true, isInfected: () => false } as never);
        await useCase.execute(makeInput());
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
        expect(file.status).toBe("READY");
    });

    it("should mark the file as infected when scan detects infection", async () => {
        const { useCase, antivirusPort, fileRepository, file } = makeSut();
        antivirusPort.scan.mockResolvedValue({ isClean: () => false, isInfected: () => true } as never);
        await useCase.execute(makeInput());
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
        expect(file.status).toBe("INFECTED");
    });

    it("should propagate file repository errors when finding the file", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        fileRepository.findById.mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when downloading the file", async () => {
        const { useCase, storagePort, antivirusPort, fileRepository } = makeSut();
        storagePort.download.mockRejectedValue(new Error("File download failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("File download failed");
        expect(storagePort.download).toHaveBeenCalledTimes(1);
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate antivirus errors when scanning the file", async () => {
        const { useCase, antivirusPort, fileRepository } = makeSut();
        antivirusPort.scan.mockRejectedValue(new Error("Antivirus scan failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Antivirus scan failed");
        expect(antivirusPort.scan).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate file repository errors when updating the file", async () => {
        const { useCase, fileRepository } = makeSut();
        fileRepository.update.mockRejectedValue(new Error("File update failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("File update failed");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });
});
