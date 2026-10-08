import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import type { Redis } from "ioredis";

import { JobScheduler, JobWorker } from "./contracts";
import { BULL_CONNECTION, BullJobSchedulerAdapter, BullJobWorkerAdapter, createBullConnection } from "./infrastructure";

@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [
        {
            provide: BULL_CONNECTION,
            useFactory: createBullConnection,
        },
        {
            provide: JobScheduler,
            useClass: BullJobSchedulerAdapter,
        },
        {
            provide: JobWorker,
            useClass: BullJobWorkerAdapter,
        },
    ],
    exports: [JobScheduler, JobWorker],
})
export class JobsModule implements OnModuleDestroy {
    constructor(@Inject(BULL_CONNECTION) private readonly connection: Redis) {}

    public async onModuleDestroy(): Promise<void> {
        await this.connection.quit();
    }
}
