import { Injectable, Logger } from "@nestjs/common";

import { AntivirusPort, FileRepository, FileStoragePort } from "../../../domain/interfaces";
import { RescanFilesInput } from "./input";

@Injectable()
export class RescanFilesJobsUseCase {
    private readonly logger = new Logger(RescanFilesJobsUseCase.name);

    constructor(
        private readonly antivirusPort: AntivirusPort,
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
    ) {}

    public async execute(input: RescanFilesInput): Promise<void> {
        const before = new Date(Date.now() - input.ageDays * 24 * 60 * 60 * 1000);
        const files = await this.fileRepository.findReadyForRescan(input.tenantId, before);
        let rescanned = 0;
        let infected = 0;
        for (const file of files) {
            const version = file.getLatestVersion();
            if (!version) {
                continue;
            }
            rescanned++;
            if (input.dryRun) {
                continue;
            }
            const buffer = await this.storagePort.download(version.getStorageKey());
            const scan = await this.antivirusPort.scan(buffer);
            file.addScanToLatestVersion(scan);
            if (scan.isInfected()) {
                file.markAsInfectedByRescan();
                infected++;
            }
            await this.fileRepository.update(file);
        }
        this.logger.log(
            `Tenant ${input.tenantId}: ${rescanned} files rescanned, ${infected} infected (dryRun: ${input.dryRun})`,
        );
    }
}
