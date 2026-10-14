import { Injectable } from "@nestjs/common";

import { File } from "../../../../domain/entities";
import { FileAlreadyExistsError, FileNotFoundError } from "../../../../domain/errors";
import { FileRepository } from "../../../../domain/interfaces";
import { ChangeFileResourceInput } from "./input";

@Injectable()
export class ChangeFileResourceUseCase {
    constructor(private readonly fileRepository: FileRepository) {}

    public async execute(input: ChangeFileResourceInput): Promise<File> {
        const file = await this.fileRepository.findById(input.fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        const existing = await this.fileRepository.findByResourceAndPurpose(
            file.tenantId,
            input.resourceType,
            input.resourceId,
            file.purpose,
        );
        if (existing && existing.id !== file.id) {
            throw new FileAlreadyExistsError();
        }
        file.changeResource(input.resourceType, input.resourceId);
        await this.fileRepository.update(file);
        return file;
    }
}
