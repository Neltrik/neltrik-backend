import { Injectable } from "@nestjs/common";

import { File } from "../../../../domain/entities";
import { FileNotFoundError } from "../../../../domain/errors";
import { FileRepository } from "../../../../domain/interfaces";
import { RenameFileInput } from "./input";

@Injectable()
export class RenameFileUseCase {
    constructor(private readonly fileRepository: FileRepository) {}

    public async execute(input: RenameFileInput): Promise<File> {
        const file = await this.fileRepository.findById(input.fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        file.rename(input.name);
        await this.fileRepository.update(file);
        return file;
    }
}
