import { Injectable } from "@nestjs/common";

import { IdGenerator } from "@/shared/id-generator";
import { JobScheduler } from "@/shared/jobs";
import { TransactionManager } from "@/shared/transaction";

import { File } from "../../../../domain/entities";
import { FileAlreadyExistsError, FileQuotaExceededError } from "../../../../domain/errors";
import { ChecksumGenerator, FileRepository, FileStoragePort } from "../../../../domain/interfaces";
import { buildFileScanJobId, FILE_SCAN_JOB, FILE_SCAN_JOB_OPTIONS, FILE_SCAN_QUEUE } from "../../../../domain/types";
import { FileVersion } from "../../../../domain/value-objects";
import { CompensatingOperationService } from "../../../compensation";
import {
    CreateOrGetQuotaInternalUseCase,
    IncrementQuotaInternalUseCase,
    VerifyQuotaLimitInternalUseCase,
} from "../../../use-cases-internal";
import { FileValidationService } from "../../../validation";
import { UploadFileInput } from "./input";
import { UploadFileOutput } from "./output";

interface PreparedUpload {
    checksum: string;
    fileId: string;
    storageKey: string;
}

@Injectable()
export class UploadFileUseCase {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly jobScheduler: JobScheduler,
        private readonly transactionManager: TransactionManager,
        private readonly checksumGenerator: ChecksumGenerator,
        private readonly fileRepository: FileRepository,
        private readonly storagePort: FileStoragePort,
        private readonly compensatingOperation: CompensatingOperationService,
        private readonly createOrGetQuotaInternalUseCase: CreateOrGetQuotaInternalUseCase,
        private readonly incrementQuotaInternalUseCase: IncrementQuotaInternalUseCase,
        private readonly verifyQuotaLimitInternalUseCase: VerifyQuotaLimitInternalUseCase,
        private readonly fileValidationService: FileValidationService,
    ) {}

    public async execute(input: UploadFileInput): Promise<UploadFileOutput> {
        await this.validate(input);
        const prepared = await this.prepare(input);
        const file = await this.uploadAndPersist(input, prepared);
        return this.toOutput(file);
    }

    private async validate(input: UploadFileInput): Promise<void> {
        await this.fileValidationService.validate({
            purpose: input.purpose,
            mimeType: input.mimeType,
            extension: input.extension,
            size: input.size,
            buffer: input.buffer,
        });
        const existing = await this.fileRepository.findByResourceAndPurpose(
            input.tenantId,
            input.resourceType,
            input.resourceId,
            input.purpose,
        );
        if (existing) {
            throw new FileAlreadyExistsError();
        }
        await this.createOrGetQuotaInternalUseCase.execute(input.tenantId);
        const canAccommodate = await this.verifyQuotaLimitInternalUseCase.execute({
            tenantId: input.tenantId,
            size: input.size,
        });
        if (!canAccommodate) {
            throw new FileQuotaExceededError();
        }
    }

    private async prepare(input: UploadFileInput): Promise<PreparedUpload> {
        const checksum = await this.checksumGenerator.generate(input.buffer);
        const fileId = this.idGenerator.generate();
        const storageKey = `tenants/${input.tenantId}/files/${fileId}/v1/${input.name}`;
        return { checksum, fileId, storageKey };
    }

    private async uploadAndPersist(input: UploadFileInput, prepared: PreparedUpload): Promise<File> {
        return this.compensatingOperation.execute(
            () => this.storagePort.upload(prepared.storageKey, input.buffer, input.mimeType),
            () => this.storagePort.delete(prepared.storageKey),
            async () => this.persistAndEnqueue(input, prepared),
        );
    }

    private async persistAndEnqueue(input: UploadFileInput, prepared: PreparedUpload): Promise<File> {
        return this.transactionManager.execute(async (context) => {
            const now = new Date();
            const version = FileVersion.createInitial({
                name: input.name,
                extension: input.extension,
                mimeType: input.mimeType,
                storageKey: prepared.storageKey,
                size: input.size,
                checksum: prepared.checksum,
                scans: [],
                createdAt: now,
            });
            const file = File.create({
                id: prepared.fileId,
                tenantId: input.tenantId,
                ownerId: input.ownerId,
                name: input.name,
                extension: input.extension,
                mimeType: input.mimeType,
                size: input.size,
                purpose: input.purpose,
                resourceType: input.resourceType,
                resourceId: input.resourceId,
                versions: [version],
                createdAt: now,
            });
            await this.fileRepository.create(file, context);
            await this.incrementQuotaInternalUseCase.execute({ tenantId: input.tenantId, size: input.size }, context);
            await this.jobScheduler.enqueue(
                FILE_SCAN_QUEUE,
                FILE_SCAN_JOB,
                { tenantId: input.tenantId, fileId: file.id, version: 1 },
                { ...FILE_SCAN_JOB_OPTIONS, jobId: buildFileScanJobId(file.id, 1) },
            );
            return file;
        });
    }

    private toOutput(file: File): UploadFileOutput {
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
