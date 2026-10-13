import { Logger } from "@nestjs/common";

import { File } from "../../../domain/entities";
import { type AntivirusScan, FileVersion } from "../../../domain/value-objects";
import { AntivirusPortSpy, FileRepositorySpy, FileStoragePortSpy } from "../../../test-doubles";
import { RescanFilesJobsUseCase } from "./index";

const makeFile = (options?: { id?: string; storageKeys?: string[] }): File => {
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
        deletedAt: null,
    });
};
const makeInput = () => ({ tenantId: "tenant-id", ageDays: 30, dryRun: false });

const makeScanResult = (infected = false): AntivirusScan =>
    ({
        status: infected ? "INFECTED" : "CLEAN",
        engine: "test-engine",
        result: infected ? "Malware detected" : "Clean",
        scannedAt: new Date(),
        isInfected: jest.fn().mockReturnValue(infected),
    }) as unknown as AntivirusScan;

describe("RescanFilesJobsUseCase", () => {
    const makeSut = () => {
        const antivirusPort = new AntivirusPortSpy();
        const fileRepository = new FileRepositorySpy();
        const storagePort = new FileStoragePortSpy();
        const useCase = new RescanFilesJobsUseCase(antivirusPort, fileRepository, storagePort);
        const file = makeFile();
        const input = makeInput();
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([file]);
        jest.spyOn(storagePort, "download").mockResolvedValue(Buffer.from("file-content"));
        jest.spyOn(antivirusPort, "scan").mockResolvedValue(makeScanResult(false));
        return { useCase, antivirusPort, fileRepository, storagePort, file, input };
    };

    it("should rescan files successfully", async () => {
        const { useCase, antivirusPort, fileRepository, storagePort, input } = makeSut();
        await expect(useCase.execute(input)).resolves.toBeUndefined();
        expect(fileRepository.findReadyForRescan).toHaveBeenCalledTimes(1);
        expect(fileRepository.findReadyForRescan).toHaveBeenCalledWith(input.tenantId, expect.any(Date));
        expect(storagePort.download).toHaveBeenCalledTimes(1);
        expect(storagePort.download).toHaveBeenCalledWith("files/file-id/v1/document.pdf");
        expect(antivirusPort.scan).toHaveBeenCalledTimes(1);
        expect(antivirusPort.scan).toHaveBeenCalledWith(Buffer.from("file-content"));
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should use the configured age period to find files eligible for rescan", async () => {
        const { useCase, fileRepository } = makeSut();
        const now = Date.now();
        const ageDays = 15;
        jest.spyOn(Date, "now").mockReturnValue(now);
        await useCase.execute({ ...makeInput(), ageDays });
        expect(fileRepository.findReadyForRescan).toHaveBeenCalledWith(
            "tenant-id",
            new Date(now - ageDays * 24 * 60 * 60 * 1000),
        );
        jest.restoreAllMocks();
    });

    it("should not download or scan files when dryRun is enabled", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        await expect(useCase.execute({ ...makeInput(), dryRun: true })).resolves.toBeUndefined();
        expect(fileRepository.findReadyForRescan).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should not process any files when no files are eligible for rescan", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(fileRepository.findReadyForRescan).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should not process files without a latest version", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        const file = makeFile();
        jest.spyOn(file, "getLatestVersion").mockReturnValue(null);
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([file]);
        const loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining("Tenant tenant-id: 0 files rescanned, 0 infected (dryRun: false)"),
        );
        loggerSpy.mockRestore();
    });

    it("should mark files as infected when the antivirus detects malware", async () => {
        const { useCase, antivirusPort, fileRepository, file } = makeSut();
        const scanResult = makeScanResult(true);
        jest.spyOn(antivirusPort, "scan").mockResolvedValue(scanResult);
        const markAsInfectedSpy = jest.spyOn(file, "markAsInfectedByRescan");
        const addScanSpy = jest.spyOn(file, "addScanToLatestVersion");
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(addScanSpy).toHaveBeenCalledWith(scanResult);
        expect(markAsInfectedSpy).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).toHaveBeenCalledWith(file);
    });

    it("should not mark files as infected when the antivirus reports a clean file", async () => {
        const { useCase, antivirusPort, fileRepository, file } = makeSut();
        const scanResult = makeScanResult(false);
        jest.spyOn(antivirusPort, "scan").mockResolvedValue(scanResult);
        const markAsInfectedSpy = jest.spyOn(file, "markAsInfectedByRescan");
        const addScanSpy = jest.spyOn(file, "addScanToLatestVersion");
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(addScanSpy).toHaveBeenCalledWith(scanResult);
        expect(markAsInfectedSpy).not.toHaveBeenCalled();
        expect(fileRepository.update).toHaveBeenCalledWith(file);
    });

    it("should rescan multiple eligible files", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        const firstFile = makeFile({ id: "file-1", storageKeys: ["files/file-1/v1/document.pdf"] });
        const secondFile = makeFile({ id: "file-2", storageKeys: ["files/file-2/v1/document.pdf"] });
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([firstFile, secondFile]);
        await expect(useCase.execute(makeInput())).resolves.toBeUndefined();
        expect(storagePort.download).toHaveBeenCalledTimes(2);
        expect(antivirusPort.scan).toHaveBeenCalledTimes(2);
        expect(fileRepository.update).toHaveBeenCalledTimes(2);
        expect(fileRepository.update).toHaveBeenNthCalledWith(1, firstFile);
        expect(fileRepository.update).toHaveBeenNthCalledWith(2, secondFile);
    });

    it("should log the number of rescanned and infected files", async () => {
        const { useCase, fileRepository, antivirusPort } = makeSut();
        const loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
        const cleanFile = makeFile({ id: "file-1" });
        const infectedFile = makeFile({ id: "file-2", storageKeys: ["files/file-2/v1/document.pdf"] });
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([cleanFile, infectedFile]);
        jest.spyOn(antivirusPort, "scan")
            .mockResolvedValueOnce(makeScanResult(false))
            .mockResolvedValueOnce(makeScanResult(true));
        await useCase.execute(makeInput());
        expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining("Tenant tenant-id: 2 files rescanned, 1 infected (dryRun: false)"),
        );
        loggerSpy.mockRestore();
    });

    it("should log the number of files that would be rescanned in dryRun mode", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        const loggerSpy = jest.spyOn(Logger.prototype, "log").mockImplementation();
        const firstFile = makeFile({ id: "file-1" });
        const secondFile = makeFile({ id: "file-2", storageKeys: ["files/file-2/v1/document.pdf"] });
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([firstFile, secondFile]);
        await useCase.execute({ ...makeInput(), dryRun: true });
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
        expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringContaining("Tenant tenant-id: 2 files rescanned, 0 infected (dryRun: true)"),
        );
        loggerSpy.mockRestore();
    });

    it("should propagate repository errors when finding files for rescan", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        jest.spyOn(fileRepository, "findReadyForRescan").mockRejectedValue(new Error("Database error"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database error");
        expect(fileRepository.findReadyForRescan).toHaveBeenCalledTimes(1);
        expect(storagePort.download).not.toHaveBeenCalled();
        expect(antivirusPort.scan).not.toHaveBeenCalled();
    });

    it("should propagate storage errors when downloading a file", async () => {
        const { useCase, storagePort, antivirusPort, fileRepository } = makeSut();
        jest.spyOn(storagePort, "download").mockRejectedValue(new Error("Storage download failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage download failed");
        expect(storagePort.download).toHaveBeenCalledTimes(1);
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate antivirus errors when scanning a file", async () => {
        const { useCase, storagePort, antivirusPort, fileRepository } = makeSut();
        jest.spyOn(antivirusPort, "scan").mockRejectedValue(new Error("Antivirus scan failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Antivirus scan failed");
        expect(storagePort.download).toHaveBeenCalledTimes(1);
        expect(antivirusPort.scan).toHaveBeenCalledTimes(1);
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors when updating a rescanned file", async () => {
        const { useCase, fileRepository } = makeSut();
        jest.spyOn(fileRepository, "update").mockRejectedValue(new Error("Database update failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Database update failed");
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should stop processing subsequent files when a rescan fails", async () => {
        const { useCase, fileRepository, storagePort, antivirusPort } = makeSut();
        const firstFile = makeFile({ id: "file-1" });
        const secondFile = makeFile({ id: "file-2", storageKeys: ["files/file-2/v1/document.pdf"] });
        jest.spyOn(fileRepository, "findReadyForRescan").mockResolvedValue([firstFile, secondFile]);
        jest.spyOn(storagePort, "download").mockRejectedValueOnce(new Error("Storage download failed"));
        await expect(useCase.execute(makeInput())).rejects.toThrow("Storage download failed");
        expect(storagePort.download).toHaveBeenCalledTimes(1);
        expect(antivirusPort.scan).not.toHaveBeenCalled();
        expect(fileRepository.update).not.toHaveBeenCalled();
    });
});
