import { Injectable } from "@nestjs/common";

import { FileNotFoundError } from "../../../../domain/errors";
import { FileRepository } from "../../../../domain/interfaces";

@Injectable()
export class DeleteFileUseCase {
    constructor(private readonly fileRepository: FileRepository) {}

    public async execute(fileId: string): Promise<string> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        file.delete();
        await this.fileRepository.update(file);
        return file.id;
    }
}
