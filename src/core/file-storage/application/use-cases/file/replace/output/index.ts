import type { FilePurpose, FileStatus } from "../../../../../domain/types";

export interface ReplaceFileOutput {
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
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
