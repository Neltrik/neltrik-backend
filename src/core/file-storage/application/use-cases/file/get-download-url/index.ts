import { Injectable } from "@nestjs/common";

import { env } from "@/config/index";

import { FileNotFoundError, InvalidFileStatusError } from "../../../../domain/errors";
import { FileRepository, FileStoragePort } from "../../../../domain/interfaces";
import { GetDownloadUrlOutput } from "./output";

@Injectable()
export class GetDownloadUrlUseCase {
    constructor(
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
    ) {}

    public async execute(fileId: string): Promise<GetDownloadUrlOutput> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        if (file.isDeleted() || file.isInfected()) {
            throw new FileNotFoundError();
        }
        if (!file.isReady()) {
            throw new InvalidFileStatusError();
        }
        const latestVersion = file.getLatestVersion();
        if (!latestVersion) {
            throw new InvalidFileStatusError();
        }
        const expiresIn = env.STORAGE_SIGNED_URL_TTL_SECONDS;
        const url = await this.storagePort.getSignedUrl(latestVersion.getStorageKey(), expiresIn);
        return {
            url,
            expiresIn,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
        };
    }
}
