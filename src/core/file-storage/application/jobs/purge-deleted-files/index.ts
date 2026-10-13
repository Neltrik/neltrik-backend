import { Injectable, Logger } from "@nestjs/common";

import { FileRepository, FileStoragePort } from "../../../domain/interfaces";
import { PurgeDeletedFilesInput } from "./input";

@Injectable()
export class PurgeDeletedFilesJobsUseCase {
    private readonly logger = new Logger(PurgeDeletedFilesJobsUseCase.name);

    constructor(
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
    ) {}

    public async execute(input: PurgeDeletedFilesInput): Promise<void> {
        const before = new Date(Date.now() - input.graceDays * 24 * 60 * 60 * 1000);
        const files = await this.fileRepository.findDeletedBefore(input.tenantId, before);
        const storageKeysInStorage = new Set(await this.storagePort.list(`tenants/${input.tenantId}/files/`));
        let wouldDeleteBinaries = 0;
        let deletedBinaries = 0;
        let filesProcessed = 0;
        for (const file of files) {
            const hasAnyBinary = file.versions.some((version) => storageKeysInStorage.has(version.getStorageKey()));
            if (!hasAnyBinary) {
                continue;
            }
            filesProcessed++;
            for (const version of file.versions) {
                wouldDeleteBinaries++;
                if (input.dryRun) {
                    continue;
                }
                await this.storagePort.delete(version.getStorageKey());
                deletedBinaries++;
            }
        }
        this.logger.log(
            `Tenant ${input.tenantId}: ${filesProcessed} files, ${wouldDeleteBinaries} binaries ${
                input.dryRun ? "would be deleted" : `deleted (${deletedBinaries})`
            } (dryRun: ${input.dryRun})`,
        );
    }
}
