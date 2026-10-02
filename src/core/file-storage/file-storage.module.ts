import { Module } from "@nestjs/common";

import { env } from "@/config/index";

import {
    CreateOrGetQuotaUseCase,
    DecrementQuotaUseCase,
    IncrementQuotaUseCase,
    VerifyQuotaLimitUseCase,
} from "./application/use-cases-internal";
import { FileQuotaRepository, FileRepository, FileStoragePort } from "./domain/interfaces";
import { B2FileStorageAdapter, LocalFileStorageAdapter } from "./infrastructure/providers";
import { PrismaFileQuotaRepository, PrismaFileRepository } from "./infrastructure/repositories";

@Module({
    providers: [
        CreateOrGetQuotaUseCase,
        DecrementQuotaUseCase,
        IncrementQuotaUseCase,
        VerifyQuotaLimitUseCase,
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
    ],
    exports: [FileRepository, FileStoragePort],
})
export class FileStorageModule {}
