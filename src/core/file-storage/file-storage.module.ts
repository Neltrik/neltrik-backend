import { Module } from "@nestjs/common";

import { env } from "@/config/index";

import { CompensatingOperationService } from "./application/compensation";
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
import {
    AntivirusPort,
    ChecksumGenerator,
    FileQuotaRepository,
    FileRepository,
    FileStoragePort,
    MagicBytesDetector,
} from "./domain/interfaces";
import {
    B2FileStorageAdapter,
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
        B2FileStorageAdapter,
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
            useClass: StubAntivirusAdapter,
        },
        {
            provide: MagicBytesDetector,
            useClass: FileTypeMagicBytesDetector,
        },
    ],
})
export class FileStorageModule {}
