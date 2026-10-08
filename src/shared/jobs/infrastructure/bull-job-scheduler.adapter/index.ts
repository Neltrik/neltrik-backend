import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { type JobsOptions, Queue } from "bullmq";
import type { Redis } from "ioredis";

import { JobScheduler } from "../../contracts/job-scheduler";
import type { EnqueueOptions, JobHandle, JobPayload, RepeatOptions } from "../../types";
import { BULL_CONNECTION } from "../bull-connection.factory";

@Injectable()
export class BullJobSchedulerAdapter extends JobScheduler implements OnModuleDestroy {
    private readonly queues = new Map<string, Queue>();

    constructor(@Inject(BULL_CONNECTION) private readonly connection: Redis) {
        super();
    }

    public async enqueue<TPayload extends JobPayload>(
        queue: string,
        jobName: string,
        payload: TPayload,
        options?: EnqueueOptions,
    ): Promise<JobHandle> {
        const bullQueue = this.getQueue(queue);
        const job = await bullQueue.add(jobName, payload, this.mapOptions(options));
        return { id: job.id ?? "", queue: job.queueName, name: job.name };
    }

    public async schedule<TPayload extends JobPayload>(
        queue: string,
        jobName: string,
        payload: TPayload,
        repeat: RepeatOptions,
        options?: EnqueueOptions,
    ): Promise<JobHandle> {
        const bullQueue = this.getQueue(queue);
        const schedulerId = `${queue}:${jobName}`;
        const job = await bullQueue.upsertJobScheduler(schedulerId, repeat, {
            name: jobName,
            data: payload,
            opts: this.mapOptions(options),
        });
        return { id: job.id ?? "", queue: job.queueName, name: jobName };
    }

    public async cancel(queue: string, jobId: string): Promise<boolean> {
        const bullQueue = this.getQueue(queue);
        const job = await bullQueue.getJob(jobId);
        if (!job) {
            return false;
        }
        const state = await job.getState();
        if (state !== "waiting" && state !== "delayed") {
            return false;
        }
        try {
            await job.remove();
            return true;
        } catch {
            return false;
        }
    }

    public async onModuleDestroy(): Promise<void> {
        for (const queue of this.queues.values()) {
            await queue.close();
        }
        this.queues.clear();
    }

    private getQueue(name: string): Queue {
        const existing = this.queues.get(name);
        if (existing) {
            return existing;
        }
        const queue = new Queue(name, { connection: this.connection });
        this.queues.set(name, queue);
        return queue;
    }

    private mapOptions(options?: EnqueueOptions): JobsOptions {
        if (!options) {
            return {};
        }
        return {
            ...(options.delayMs !== undefined && { delay: options.delayMs }),
            ...(options.attempts !== undefined && { attempts: options.attempts }),
            ...(options.backoff && {
                backoff: { type: options.backoff.type, delay: options.backoff.delayMs },
            }),
            ...(options.priority !== undefined && { priority: options.priority }),
            ...(options.jobId !== undefined && { jobId: options.jobId }),
            ...(options.removeOnComplete !== undefined && {
                removeOnComplete: options.removeOnComplete,
            }),
            ...(options.removeOnFail !== undefined && {
                removeOnFail: options.removeOnFail,
            }),
        };
    }
}
