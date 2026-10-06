import type { File as PrismaFile } from "@prisma/client";

import { File } from "../../../domain/entities";
import { FILE_PURPOSE, FILE_STATUS, type FileProps } from "../../../domain/types";
import { AntivirusScan, FileVersion } from "../../../domain/value-objects";
import { FileMapper } from "./index";

const createProps = (): FileProps => {
    const createdAt = new Date("2026-01-15T10:30:00.000Z");
    const scan = AntivirusScan.clean("ClamAV", createdAt);
    const version = FileVersion.create({
        version: 1,
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        storageKey: "files/document.pdf",
        size: 1024,
        checksum: "sha256:abc123",
        scans: [scan],
        createdAt,
    });
    return {
        id: "file-id",
        tenantId: "tenant-id",
        ownerId: "owner-id",
        name: "document",
        extension: "pdf",
        mimeType: "application/pdf",
        size: 1024,
        purpose: FILE_PURPOSE.DOCUMENT,
        status: FILE_STATUS.READY,
        resourceType: "PROJECT",
        resourceId: "project-id",
        versions: [version],
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
    };
};

describe("FileMapper", () => {
    it("should map a domain file to persistence", () => {
        const file = File.restore(createProps());
        const persistence = FileMapper.toPersistence(file);
        expect(persistence).toEqual({
            id: file.id,
            tenantId: file.tenantId,
            ownerId: file.ownerId,
            name: file.name,
            extension: file.extension,
            mimeType: file.mimeType,
            size: file.size,
            purpose: file.purpose,
            status: file.status,
            resourceType: file.resourceType,
            resourceId: file.resourceId,
            versions: [
                {
                    version: 1,
                    name: "document",
                    extension: "pdf",
                    mimeType: "application/pdf",
                    storageKey: "files/document.pdf",
                    size: 1024,
                    checksum: "sha256:abc123",
                    scans: [{ status: "CLEAN", engine: "ClamAV", result: null, scannedAt: "2026-01-15T10:30:00.000Z" }],
                    createdAt: "2026-01-15T10:30:00.000Z",
                },
            ],
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            deletedAt: null,
        });
    });

    const expectFileProperties = (file: File, persistence: PrismaFile): void => {
        expect(file).toBeInstanceOf(File);
        expect(file.id).toBe(persistence.id);
        expect(file.tenantId).toBe(persistence.tenantId);
        expect(file.ownerId).toBe(persistence.ownerId);
        expect(file.name).toBe(persistence.name);
        expect(file.extension).toBe(persistence.extension);
        expect(file.mimeType).toBe(persistence.mimeType);
        expect(file.size).toBe(1024);
        expect(file.purpose).toBe(persistence.purpose);
        expect(file.status).toBe(persistence.status);
        expect(file.resourceType).toBe(persistence.resourceType);
        expect(file.resourceId).toBe(persistence.resourceId);
        expect(file.createdAt).toEqual(persistence.createdAt);
        expect(file.updatedAt).toEqual(persistence.updatedAt);
        expect(file.deletedAt).toBeNull();
    };

    const expectVersionProperties = (file: File): void => {
        const version = file.getLatestVersion();
        expect(version).not.toBeNull();
        expect(version?.getVersion()).toBe(1);
        expect(version?.getName()).toBe("document");
        expect(version?.getExtension()).toBe("pdf");
        expect(version?.getMimeType()).toBe("application/pdf");
        expect(version?.getStorageKey()).toBe("files/document.pdf");
        expect(version?.getSize()).toBe(1024);
        expect(version?.getChecksum()).toBe("sha256:abc123");
    };

    const expectScanProperties = (file: File): void => {
        const scan = file.getLatestVersion()?.getLatestScan();
        expect(scan).not.toBeNull();
        expect(scan?.getStatus()).toBe("CLEAN");
        expect(scan?.getEngine()).toBe("ClamAV");
        expect(scan?.getResult()).toBeNull();
        expect(scan?.getScannedAt()).toEqual(new Date("2026-01-15T10:30:00.000Z"));
    };

    it("should map a persistence file to domain", () => {
        const props = createProps();
        const persistence = {
            ...props,
            size: BigInt(props.size),
            versions: [
                {
                    version: 1,
                    name: "document",
                    extension: "pdf",
                    mimeType: "application/pdf",
                    storageKey: "files/document.pdf",
                    size: 1024,
                    checksum: "sha256:abc123",
                    scans: [{ status: "CLEAN", engine: "ClamAV", result: null, scannedAt: "2026-01-15T10:30:00.000Z" }],
                    createdAt: "2026-01-15T10:30:00.000Z",
                },
            ],
        } as unknown as PrismaFile;
        const file = FileMapper.toDomain(persistence);
        expectFileProperties(file, persistence);
        expectVersionProperties(file);
        expectScanProperties(file);
    });
});
