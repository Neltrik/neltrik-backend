import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { FileStorageModule } from "./core/file-storage/file-storage.module";
import { PrismaModule } from "./prisma";
import { IdGeneratorModule } from "./shared/id-generator";
import { JobsModule } from "./shared/jobs/jobs.module";
import { WorkerBootstrap } from "./worker.bootstrap";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DiscoveryModule,
        PrismaModule,
        JobsModule,
        IdGeneratorModule,
        FileStorageModule,
    ],
    providers: [WorkerBootstrap],
})
export class WorkerModule {}
