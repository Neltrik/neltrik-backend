import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";

import { JOB_HANDLER_METADATA, JobHandler, JobWorker } from "@/shared/jobs";

@Injectable()
export class WorkerBootstrap implements OnApplicationBootstrap, OnApplicationShutdown {
    private readonly logger = new Logger(WorkerBootstrap.name);

    constructor(
        private readonly jobWorker: JobWorker,
        private readonly discoveryService: DiscoveryService,
    ) {}

    public async onApplicationBootstrap(): Promise<void> {
        const handlers = this.discoverHandlers();
        this.logger.log(
            `Discovered ${handlers.length} handler(s): ${handlers.map((h) => `${h.queue}:${h.name}`).join(", ")}`,
        );
        await this.jobWorker.start(handlers);
        this.logger.log("Job worker started");
    }

    public async onApplicationShutdown(): Promise<void> {
        await this.jobWorker.stop();
        this.logger.log("Job worker stopped");
    }

    private discoverHandlers(): JobHandler[] {
        const providers = this.discoveryService.getProviders();
        return providers
            .filter((wrapper) => {
                if (!wrapper.metatype) {
                    return false;
                }
                return Reflect.getMetadata(JOB_HANDLER_METADATA, wrapper.metatype) === true;
            })
            .map((wrapper) => wrapper.instance as JobHandler);
    }
}
