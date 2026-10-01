import { Injectable } from "@nestjs/common";

import { FileNotFoundError } from "../../../../domain/errors";
import { FileRepository } from "../../../../domain/interfaces";
import { GetFileOutput } from "./output";

@Injectable()
export class GetFileUseCase {
    constructor(private readonly fileRepository: FileRepository) {}

    public async execute(fileId: string): Promise<GetFileOutput> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        if (file.isDeleted() || file.isInfected()) {
            throw new FileNotFoundError();
        }
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
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            deletedAt: file.deletedAt,
        };
    }
}
