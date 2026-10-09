import { Injectable } from "@nestjs/common";

import { JobScheduler } from "@/shared/jobs";
import { TransactionManager } from "@/shared/transaction";

import { File } from "../../../../domain/entities";
import { FileNotFoundError, FileQuotaExceededError, InvalidFileStatusError } from "../../../../domain/errors";
import { ChecksumGenerator, FileRepository, FileStoragePort } from "../../../../domain/interfaces";
import { buildFileScanJobId, FILE_SCAN_JOB, FILE_SCAN_JOB_OPTIONS, FILE_SCAN_QUEUE } from "../../../../domain/types";
import { FileVersion } from "../../../../domain/value-objects";
import { CompensatingOperationService } from "../../../compensation";
import { IncrementQuotaInternalUseCase, VerifyQuotaLimitInternalUseCase } from "../../../use-cases-internal";
import { FileValidationService } from "../../../validation";
import { ReplaceFileInput } from "./input";
import { ReplaceFileOutput } from "./output";

interface PreparedReplace {
    checksum: string;
    storageKey: string;
    nextVersion: number;
}

@Injectable()
export class ReplaceFileUseCase {
    constructor(
        private readonly jobScheduler: JobScheduler,
        private readonly transactionManager: TransactionManager,
        private readonly checksumGenerator: ChecksumGenerator,
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
        private readonly compensatingOperation: CompensatingOperationService,
        private readonly incrementQuotaInternalUseCase: IncrementQuotaInternalUseCase,
        private readonly verifyQuotaLimitInternalUseCase: VerifyQuotaLimitInternalUseCase,
        private readonly fileValidationService: FileValidationService,
    ) {}

    public async execute(input: ReplaceFileInput): Promise<ReplaceFileOutput> {
        const file = await this.findAndValidate(input);
        const prepared = await this.prepare(input, file);
        const updated = await this.uploadAndPersist(input, file, prepared);
        return this.toOutput(updated);
    }

    private async findAndValidate(input: ReplaceFileInput): Promise<File> {
        const file = await this.fileRepository.findById(input.fileId);
        if (!file) {
            throw new FileNotFoundError();
        }
        if (!file.isReady() && !file.isInfected()) {
            throw new InvalidFileStatusError();
        }
        await this.fileValidationService.validate({
            purpose: file.purpose,
            mimeType: input.mimeType,
            extension: input.extension,
            size: input.size,
            buffer: input.buffer,
        });
        const canAccommodate = await this.verifyQuotaLimitInternalUseCase.execute({
            tenantId: file.tenantId,
            size: input.size,
        });
        if (!canAccommodate) {
            throw new FileQuotaExceededError();
        }
        return file;
    }

    private async prepare(input: ReplaceFileInput, file: File): Promise<PreparedReplace> {
        const checksum = await this.checksumGenerator.generate(input.buffer);
        const latest = file.getLatestVersion();
        if (!latest) {
            throw new InvalidFileStatusError();
        }
        const nextVersion = latest.getVersion() + 1;
        const storageKey = `tenants/${file.tenantId}/files/${file.id}/v${nextVersion}/${input.name}`;
        return { checksum, storageKey, nextVersion };
    }

    private async uploadAndPersist(input: ReplaceFileInput, file: File, prepared: PreparedReplace): Promise<File> {
        return this.compensatingOperation.execute(
            () => this.storagePort.upload(prepared.storageKey, input.buffer, input.mimeType),
            () => this.storagePort.delete(prepared.storageKey),
            async () => this.persistAndEnqueue(input, file, prepared),
        );
    }

    private async persistAndEnqueue(input: ReplaceFileInput, file: File, prepared: PreparedReplace): Promise<File> {
        return this.transactionManager.execute(async (context) => {
            const now = new Date();
            const version = FileVersion.create({
                version: prepared.nextVersion,
                name: input.name,
                extension: input.extension,
                mimeType: input.mimeType,
                storageKey: prepared.storageKey,
                size: input.size,
                checksum: prepared.checksum,
                scans: [],
                createdAt: now,
            });
            file.addVersion(version);
            await this.fileRepository.update(file, context);
            await this.incrementQuotaInternalUseCase.execute({ tenantId: file.tenantId, size: input.size }, context);
            await this.jobScheduler.enqueue(
                FILE_SCAN_QUEUE,
                FILE_SCAN_JOB,
                { tenantId: file.tenantId, fileId: file.id, version: prepared.nextVersion },
                { ...FILE_SCAN_JOB_OPTIONS, jobId: buildFileScanJobId(file.id, prepared.nextVersion) },
            );
            return file;
        });
    }

    private toOutput(file: File): ReplaceFileOutput {
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
