import type { File as PrismaFile } from "@prisma/client";

import { File } from "../../../domain/entities";
import type { FilePurpose, PersistedFileVersion } from "../../../domain/types";
import { AntivirusScan, FileVersion } from "../../../domain/value-objects";

export class FileMapper {
    public static toPersistence(file: File) {
        return {
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
            versions: file.versions.map((version) => ({
                version: version.getVersion(),
                storageKey: version.getStorageKey(),
                size: version.getSize(),
                checksum: version.getChecksum(),
                scans: version.getScans().map((scan) => ({
                    status: scan.getStatus(),
                    engine: scan.getEngine(),
                    result: scan.getResult(),
                    scannedAt: scan.getScannedAt().toISOString(),
                })),
                createdAt: version.getCreatedAt().toISOString(),
            })),
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            deletedAt: file.deletedAt,
        };
    }

    public static toDomain(file: PrismaFile): File {
        const versions = file.versions as unknown as PersistedFileVersion[];
        return File.restore({
            id: file.id,
            tenantId: file.tenantId,
            ownerId: file.ownerId,
            name: file.name,
            extension: file.extension,
            mimeType: file.mimeType,
            size: Number(file.size),
            purpose: file.purpose as FilePurpose,
            status: file.status,
            resourceType: file.resourceType,
            resourceId: file.resourceId,
            versions: versions.map((item) =>
                FileVersion.create({
                    version: item.version,
                    storageKey: item.storageKey,
                    size: item.size,
                    checksum: item.checksum,
                    scans: item.scans.map((scan) =>
                        AntivirusScan.create({
                            status: scan.status,
                            engine: scan.engine,
                            result: scan.result,
                            scannedAt: new Date(scan.scannedAt),
                        }),
                    ),
                    createdAt: new Date(item.createdAt),
                }),
            ),
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            deletedAt: file.deletedAt,
        });
    }
}
