import { BadRequestException } from "@nestjs/common";

import { type GetFileResponseDto } from "../../dto";

export class FileControllerHelper {
    public static extractExtension(filename: string): string {
        const parts = filename.split(".");
        if (parts.length < 2) {
            throw new BadRequestException("File must have an extension.");
        }
        return parts[parts.length - 1] ?? "";
    }

    public static toFileResponse(output: GetFileResponseDto): GetFileResponseDto {
        return {
            id: output.id,
            tenantId: output.tenantId,
            ownerId: output.ownerId,
            name: output.name,
            extension: output.extension,
            mimeType: output.mimeType,
            size: output.size,
            purpose: output.purpose,
            status: output.status,
            resourceType: output.resourceType,
            resourceId: output.resourceId,
            createdAt: output.createdAt,
            updatedAt: output.updatedAt,
            deletedAt: output.deletedAt,
        };
    }
}
