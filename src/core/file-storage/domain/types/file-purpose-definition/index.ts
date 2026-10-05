import { FILE_PURPOSE, type FilePurpose } from "../file";

export interface FilePurposeDefinition {
    allowedMimeTypes: string[];
    maxSizeBytes: number;
}

export const FILE_PURPOSE_DEFINITIONS: Record<FilePurpose, FilePurposeDefinition> = {
    [FILE_PURPOSE.CV]: {
        allowedMimeTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
    },
    [FILE_PURPOSE.AVATAR]: {
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        maxSizeBytes: 2 * 1024 * 1024, // 2MB
    },
    [FILE_PURPOSE.DOCUMENT]: {
        allowedMimeTypes: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
        ],
        maxSizeBytes: 25 * 1024 * 1024, // 25MB
    },
};
