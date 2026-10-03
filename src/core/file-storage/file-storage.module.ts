import { Module } from "@nestjs/common";

import { env } from "@/config/index";

import { AdjustQuotaLimitUseCase, GetFileQuotaUseCase } from "./application/use-cases";
import {
    CreateOrGetQuotaUseCase,
    DecrementQuotaUseCase,
    IncrementQuotaUseCase,
    VerifyQuotaLimitUseCase,
} from "./application/use-cases-internal";
import { FileQuotaRepository, FileRepository, FileStoragePort } from "./domain/interfaces";
import { B2FileStorageAdapter, LocalFileStorageAdapter } from "./infrastructure/providers";
import { PrismaFileQuotaRepository, PrismaFileRepository } from "./infrastructure/repositories";
import { FileStorageQuotaController } from "./presentation/controllers";

@Module({
    controllers: [FileStorageQuotaController],
    providers: [
        AdjustQuotaLimitUseCase,
        GetFileQuotaUseCase,
        CreateOrGetQuotaUseCase,
        DecrementQuotaUseCase,
        IncrementQuotaUseCase,
        VerifyQuotaLimitUseCase,
        LocalFileStorageAdapter,
        B2FileStorageAdapter,
        FileStorageQuotaController,
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
    ],
    exports: [FileRepository, FileStoragePort],
})
export class FileStorageModule {}
