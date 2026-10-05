import type { FilePurpose } from "../../../domain/types";

export interface FileValidationInput {
    purpose: FilePurpose;
    mimeType: string;
    extension: string;
    size: number;
    buffer: Buffer;
}
