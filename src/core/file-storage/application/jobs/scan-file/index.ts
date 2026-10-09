import { Injectable } from "@nestjs/common";

import { FileNotFoundError, FileVersionNotFoundError } from "../../../domain/errors";
import { AntivirusPort, FileRepository, FileStoragePort } from "../../../domain/interfaces";
import { ScanFileInput } from "./input";

@Injectable()
export class ScanFileJobsUseCase {
    constructor(
        private readonly antivirusPort: AntivirusPort,
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
    ) {}

    public async execute(input: ScanFileInput): Promise<void> {
        const file = await this.fileRepository.findById(input.fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        if (file.tenantId !== input.tenantId) {
            throw new FileNotFoundError();
        }
        if (!file.isPending()) {
            return;
        }
        const version = file.getLatestVersion();
        if (!version || version.getVersion() !== input.version) {
            throw new FileVersionNotFoundError();
        }
        if (version.getScans().length > 0) {
            return;
        }
        const buffer = await this.storagePort.download(version.getStorageKey());
        const scan = await this.antivirusPort.scan(buffer);
        file.addScanToLatestVersion(scan);
        if (scan.isClean()) {
            file.markReady();
        } else if (scan.isInfected()) {
            file.markInfected();
        }
        await this.fileRepository.update(file);
    }
}
