import { HttpStatus, Module, OnModuleInit } from "@nestjs/common";

import { env } from "@/config/index";
import { TenantModule } from "@/core/tenant/tenant.module";
import { DomainStatusRegistry } from "@/shared/http";
import { JobScheduler } from "@/shared/jobs";

import { CompensatingOperationService } from "./application/compensation";
import {
    PurgeDeletedFilesJobsUseCase,
    ReconcileStorageJobsUseCase,
    RescanFilesJobsUseCase,
    ScanFileJobsUseCase,
} from "./application/jobs";
import {
    AdjustQuotaLimitUseCase,
    DeleteFileUseCase,
    GetDownloadUrlUseCase,
    GetFileQuotaUseCase,
    GetFileUseCase,
    ListFilesUseCase,
    ReplaceFileUseCase,
    UploadFileUseCase,
} from "./application/use-cases";
import {
    CreateOrGetQuotaInternalUseCase,
    DecrementQuotaInternalUseCase,
    IncrementQuotaInternalUseCase,
    VerifyQuotaLimitInternalUseCase,
} from "./application/use-cases-internal";
import { FileValidationService } from "./application/validation";
import { DOMAIN_ERROR_CODES } from "./domain/errors";
import {
    AntivirusPort,
    ChecksumGenerator,
    FileQuotaRepository,
    FileRepository,
    FileStoragePort,
    MagicBytesDetector,
} from "./domain/interfaces";
import {
    PURGE_DELETED_FILES_JOB,
    PURGE_DELETED_FILES_QUEUE,
    RECONCILE_STORAGE_JOB,
    RECONCILE_STORAGE_QUEUE,
    RESCAN_FILES_JOB,
    RESCAN_FILES_QUEUE,
} from "./domain/types";
import {
    PurgeDeletedFilesHandler,
    ReconcileStorageHandler,
    RescanFilesHandler,
    ScanFileHandler,
} from "./infrastructure/jobs";
import {
    B2FileStorageAdapter,
    ClamavAntivirusAdapter,
    ClamavClient,
    FileTypeMagicBytesDetector,
    LocalFileStorageAdapter,
    NodeChecksumGenerator,
    StubAntivirusAdapter,
} from "./infrastructure/providers";
import { PrismaFileQuotaRepository, PrismaFileRepository } from "./infrastructure/repositories";
import { FileController, FileStorageQuotaController } from "./presentation/controllers";

@Module({
    controllers: [FileController, FileStorageQuotaController],
    providers: [
        ScanFileJobsUseCase,
        ReconcileStorageJobsUseCase,
        PurgeDeletedFilesJobsUseCase,
        RescanFilesJobsUseCase,
        AdjustQuotaLimitUseCase,
        GetFileQuotaUseCase,
        GetFileUseCase,
        ListFilesUseCase,
        DeleteFileUseCase,
        UploadFileUseCase,
        ReplaceFileUseCase,
        GetDownloadUrlUseCase,
        CreateOrGetQuotaInternalUseCase,
        DecrementQuotaInternalUseCase,
        IncrementQuotaInternalUseCase,
        VerifyQuotaLimitInternalUseCase,
        FileValidationService,
        CompensatingOperationService,
        LocalFileStorageAdapter,
        ScanFileHandler,
        PurgeDeletedFilesHandler,
        ReconcileStorageHandler,
        RescanFilesHandler,
        B2FileStorageAdapter,
        {
            provide: ClamavClient,
            useFactory: (): ClamavClient => new ClamavClient(env.CLAMAV_HOST, env.CLAMAV_PORT, env.CLAMAV_TIMEOUT_MS),
        },
        ClamavAntivirusAdapter,
        StubAntivirusAdapter,
        {
            provide: FileRepository,
            useClass: PrismaFileRepository,
        },
        {
            provide: FileQuotaRepository,
            useClass: PrismaFileQuotaRepository,
        },
        {
            provide: FileStoragePort,
            useFactory: (local: LocalFileStorageAdapter, b2: B2FileStorageAdapter): FileStoragePort => {
                return env.STORAGE_DRIVER === "b2" ? b2 : local;
            },
            inject: [LocalFileStorageAdapter, B2FileStorageAdapter],
        },
        {
            provide: ChecksumGenerator,
            useClass: NodeChecksumGenerator,
        },
        {
            provide: AntivirusPort,
            useFactory: (stub: StubAntivirusAdapter, clamav: ClamavAntivirusAdapter): AntivirusPort => {
                return env.ANTIVIRUS_DRIVER === "clamav" ? clamav : stub;
            },
            inject: [StubAntivirusAdapter, ClamavAntivirusAdapter],
        },
        {
            provide: MagicBytesDetector,
            useClass: FileTypeMagicBytesDetector,
        },
    ],
    imports: [TenantModule],
})
export class FileStorageModule implements OnModuleInit {
    constructor(private readonly jobScheduler: JobScheduler) {}

    public async onModuleInit(): Promise<void> {
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.FILE_QUOTA_NOT_FOUND, HttpStatus.NOT_FOUND);
        DomainStatusRegistry.register(DOMAIN_ERROR_CODES.FILE_VERSION_NOT_FOUND, HttpStatus.NOT_FOUND);

        await this.jobScheduler.schedule(
            RECONCILE_STORAGE_QUEUE,
            RECONCILE_STORAGE_JOB,
            {},
            { pattern: env.RECONCILE_CRON },
            {
                jobId: "reconcile-storage-recurring",
                attempts: 3,
                backoff: { type: "exponential", delayMs: 5000 },
            },
        );
        await this.jobScheduler.schedule(
            PURGE_DELETED_FILES_QUEUE,
            PURGE_DELETED_FILES_JOB,
            {},
            { pattern: env.FILE_DELETION_CRON },
            {
                jobId: "purge-deleted-files-recurring",
                attempts: 3,
                backoff: { type: "exponential", delayMs: 5000 },
            },
        );
        await this.jobScheduler.schedule(
            RESCAN_FILES_QUEUE,
            RESCAN_FILES_JOB,
            {},
            { pattern: env.RESCAN_CRON },
            {
                jobId: "rescan-files-recurring",
                attempts: 3,
                backoff: { type: "exponential", delayMs: 5000 },
            },
        );
    }
}
