import { Injectable } from "@nestjs/common";

import {
    InvalidFileExtensionError,
    InvalidFileMagicBytesError,
    InvalidFilePurposeError,
    InvalidFileSizeError,
    InvalidMimeTypeError,
} from "../../domain/errors";
import { MagicBytesDetector } from "../../domain/interfaces";
import { FILE_PURPOSE, type FilePurpose } from "../../domain/types";
import { FILE_PURPOSE_DEFINITIONS } from "../../domain/types";
import { FileValidationInput } from "./input";

@Injectable()
export class FileValidationService {
    constructor(private readonly magicBytesDetector: MagicBytesDetector) {}

    public async validate(input: FileValidationInput): Promise<void> {
        this.ensurePurposeIsValid(input.purpose);
        const definition = FILE_PURPOSE_DEFINITIONS[input.purpose];
        this.ensureMimeTypeIsAllowed(input.mimeType, definition.allowedMimeTypes);
        this.ensureExtensionMatchesMimeType(input.extension, input.mimeType);
        await this.ensureMagicBytesMatchMimeType(input.buffer, input.mimeType);
        this.ensureSizeIsWithinLimit(input.size, definition.maxSizeBytes);
    }

    private ensurePurposeIsValid(purpose: FilePurpose): void {
        if (!Object.values(FILE_PURPOSE).includes(purpose)) {
            throw new InvalidFilePurposeError();
        }
    }

    private ensureMimeTypeIsAllowed(mimeType: string, allowed: string[]): void {
        if (!allowed.includes(mimeType)) {
            throw new InvalidMimeTypeError();
        }
    }

    private ensureExtensionMatchesMimeType(extension: string, mimeType: string): void {
        if (!this.isExtensionCoherent(extension, mimeType)) {
            throw new InvalidFileExtensionError();
        }
    }

    private async ensureMagicBytesMatchMimeType(buffer: Buffer, mimeType: string): Promise<void> {
        const detected = await this.magicBytesDetector.detect(buffer);
        if (detected !== mimeType) {
            throw new InvalidFileMagicBytesError();
        }
    }

    private ensureSizeIsWithinLimit(size: number, maxSizeBytes: number): void {
        if (size <= 0 || size > maxSizeBytes) {
            throw new InvalidFileSizeError();
        }
    }

    private isExtensionCoherent(extension: string, mimeType: string): boolean {
        const normalizedExtension = extension.toLowerCase().replace(/^\./, "");
        const expected = this.mimeTypeToExtensions(mimeType);
        return expected.includes(normalizedExtension);
    }

    private mimeTypeToExtensions(mimeType: string): string[] {
        switch (mimeType) {
            case "application/pdf":
                return ["pdf"];
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return ["docx"];
            case "image/jpeg":
                return ["jpg", "jpeg"];
            case "image/png":
                return ["png"];
            case "image/webp":
                return ["webp"];
            default:
                return [];
        }
    }
}
