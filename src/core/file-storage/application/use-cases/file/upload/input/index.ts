import type { FilePurpose } from "../../../../../domain/types";

export interface UploadFileInput {
    tenantId: string;
    ownerId: string;
    buffer: Buffer;
    name: string;
    extension: string;
    mimeType: string;
    size: number;
    purpose: FilePurpose;
    resourceType: string;
    resourceId: string;
}
