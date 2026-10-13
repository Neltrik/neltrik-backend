import { Injectable, Logger } from "@nestjs/common";

import { FileRepository, FileStoragePort } from "../../../domain/interfaces";
import { ReconcileStorageInput } from "./input";

@Injectable()
export class ReconcileStorageJobsUseCase {
    private readonly logger = new Logger(ReconcileStorageJobsUseCase.name);

    constructor(
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
    ) {}

    public async execute(input: ReconcileStorageInput): Promise<void> {
        const files = await this.fileRepository.findAllByTenant(input.tenantId);
        const storageKeysInStorage = await this.storagePort.list(`tenants/${input.tenantId}/files/`);
        const storageKeysInDB = new Set<string>();
        for (const file of files) {
            for (const version of file.versions) {
                storageKeysInDB.add(version.getStorageKey());
            }
        }
        const storageKeysSet = new Set(storageKeysInStorage);
        const orphanBinaries: string[] = [];
        for (const key of storageKeysInStorage) {
            if (!storageKeysInDB.has(key)) {
                orphanBinaries.push(key);
            }
        }
        const orphanFiles = files
            .filter((file) => !file.isDeleted())
            .filter((file) => file.versions.every((version) => !storageKeysSet.has(version.getStorageKey())));
        this.logger.log(
            `Tenant ${input.tenantId}: ${orphanBinaries.length} orphan binaries, ${orphanFiles.length} orphan files (dryRun: ${input.dryRun})`,
        );
        if (input.dryRun) {
            return;
        }
        for (const key of orphanBinaries) {
            await this.storagePort.delete(key);
        }
        for (const file of orphanFiles) {
            file.markAsOrphan();
            await this.fileRepository.update(file);
        }
    }
}
