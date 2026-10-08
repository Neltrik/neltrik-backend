import { Inject, Injectable } from "@nestjs/common";
import { type Job, Worker } from "bullmq";
import type { Redis } from "ioredis";

import type { JobHandler } from "../../contracts/job-handler";
import { JobWorker } from "../../contracts/job-worker";
import type { JobContext, JobPayload } from "../../types";
import { BULL_CONNECTION } from "../bull-connection.factory";

@Injectable()
export class BullJobWorkerAdapter extends JobWorker {
    private readonly workers = new Map<string, Worker>();
    private readonly activeControllers = new Map<string, AbortController>();

    constructor(@Inject(BULL_CONNECTION) private readonly connection: Redis) {
        super();
    }

    public async start(handlers: JobHandler[]): Promise<void> {
        if (this.workers.size > 0) {
            return;
        }
        if (handlers.length === 0) {
            throw new Error("BullJobWorkerAdapter: no handlers provided");
        }
        const handlersByQueue = this.groupByQueue(handlers);
        try {
            for (const [queueName, queueHandlers] of handlersByQueue) {
                const worker = new Worker(
                    queueName,
                    async (job) => {
                        await this.processJob(job, queueHandlers);
                    },
                    { connection: this.connection },
                );
                this.workers.set(queueName, worker);
                await worker.waitUntilReady();
            }
        } catch (error) {
            await this.stop();
            throw error;
        }
    }

    public async stop(): Promise<void> {
        for (const controller of this.activeControllers.values()) {
            controller.abort();
        }
        try {
            for (const worker of this.workers.values()) {
                await worker.close();
            }
        } finally {
            this.workers.clear();
            this.activeControllers.clear();
        }
    }

    private async processJob(job: Job, handlers: JobHandler[]): Promise<void> {
        const handler = handlers.find((h) => h.name === job.name);
        if (!handler) {
            throw new Error(`No handler found for job "${job.name}"`);
        }
        const jobId = job.id ?? "";
        const controller = new AbortController();
        if (jobId) {
            this.activeControllers.set(jobId, controller);
        }
        try {
            const ctx: JobContext = { jobId, attempt: job.attemptsMade + 1, signal: controller.signal };
            await handler.handle(job.data as JobPayload, ctx);
        } finally {
            if (jobId) {
                this.activeControllers.delete(jobId);
            }
        }
    }

    private groupByQueue(handlers: JobHandler[]): Map<string, JobHandler[]> {
        const map = new Map<string, JobHandler[]>();
        for (const handler of handlers) {
            const existing = map.get(handler.queue) ?? [];
            existing.push(handler);
            map.set(handler.queue, existing);
        }
        return map;
    }
}
