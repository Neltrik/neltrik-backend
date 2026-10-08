import type { EnqueueOptions, JobHandle, JobPayload, RepeatOptions } from "../../types";

export abstract class JobScheduler {
    public abstract enqueue<TPayload extends JobPayload>(
        queue: string,
        jobName: string,
        payload: TPayload,
        options?: EnqueueOptions,
    ): Promise<JobHandle>;
    public abstract schedule<TPayload extends JobPayload>(
        queue: string,
        jobName: string,
        payload: TPayload,
        repeat: RepeatOptions,
        options?: EnqueueOptions,
    ): Promise<JobHandle>;
    public abstract cancel(queue: string, jobId: string): Promise<boolean>;
}
