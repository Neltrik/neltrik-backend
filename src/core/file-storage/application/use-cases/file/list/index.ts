import { Injectable } from "@nestjs/common";

import { paginate } from "@/shared/pagination";

import { FileRepository } from "../../../../domain/interfaces";
import { ListFilesInput } from "./input";
import { ListFilesOutput } from "./output";

@Injectable()
export class ListFilesUseCase {
    constructor(private readonly fileRepository: FileRepository) {}

    public async execute(input: ListFilesInput): Promise<ListFilesOutput> {
        const files = await this.fileRepository.findMany({
            tenantId: input.tenantId,
            ownerId: input.ownerId,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            purpose: input.purpose,
            status: input.status,
            cursor: input.cursor,
            limit: input.limit,
        });
        const { items, meta } = paginate({
            items: files,
            limit: input.limit,
            getId: (file) => file.id,
        });
        return { files: items, meta };
    }
}
