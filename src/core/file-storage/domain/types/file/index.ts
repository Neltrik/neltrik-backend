import type { PaginationInput } from "@/shared/pagination";

import { type FileVersion } from "../../value-objects";

export const ANTIVIRUS_SCAN_STATUS = {
    CLEAN: "CLEAN",
    INFECTED: "INFECTED",
    ERROR: "ERROR",
} as const;
export type AntivirusScanStatus = (typeof ANTIVIRUS_SCAN_STATUS)[keyof typeof ANTIVIRUS_SCAN_STATUS];

export const FILE_PURPOSE = {
    CV: "CV",
    AVATAR: "AVATAR",
    DOCUMENT: "DOCUMENT",
} as const;
export type FilePurpose = (typeof FILE_PURPOSE)[keyof typeof FILE_PURPOSE];

export const FILE_STATUS = {
    PENDING: "PENDING",
    READY: "READY",
    INFECTED: "INFECTED",
    DELETED: "DELETED",
} as const;
export type FileStatus = (typeof FILE_STATUS)[keyof typeof FILE_STATUS];

export interface FileProps {
    id: string;
    tenantId: string;
    ownerId: string;
    name: string;
    extension: string;
    mimeType: string;
    size: number;
    purpose: FilePurpose;
    status: FileStatus;
    resourceType: string;
    resourceId: string;
    versions: FileVersion[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

interface PersistedAntivirusScan {
    status: AntivirusScanStatus;
    engine: string;
    result: string | null;
    scannedAt: string;
}

export interface PersistedFileVersion {
    version: number;
    storageKey: string;
    size: number;
    checksum: string;
    scans: PersistedAntivirusScan[];
    createdAt: string;
}

export interface FindManyFilesParams extends PaginationInput {
    tenantId: string;
    ownerId?: string;
    resourceType?: string;
    resourceId?: string;
    purpose?: FilePurpose;
    status?: FileStatus;
}
