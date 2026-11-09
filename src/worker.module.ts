import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiscoveryModule } from "@nestjs/core";

import { AuthorizationModule } from "./core/authorization/authorization.module";
import { FileStorageModule } from "./core/file-storage/file-storage.module";
import { NotificationsModule } from "./core/notifications/notifications.module";
import { TenantModule } from "./core/tenant/tenant.module";
import { PrismaModule } from "./prisma";
import { IdGeneratorModule } from "./shared/id-generator";
import { JobsModule } from "./shared/jobs/jobs.module";
import { OutboxModule } from "./shared/outbox/outbox.module";
import { OutboxScheduler } from "./shared/outbox/scheduler";
import { WorkerBootstrap } from "./worker.bootstrap";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DiscoveryModule,
        PrismaModule,
        JobsModule,
        IdGeneratorModule,
        OutboxModule,
        FileStorageModule,
        NotificationsModule,
        TenantModule,
        AuthorizationModule,
    ],
    providers: [WorkerBootstrap, OutboxScheduler],
})
export class WorkerModule {}
