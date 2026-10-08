export const JOB_STATE = {
    WAITING: "waiting",
    ACTIVE: "active",
    COMPLETED: "completed",
    FAILED: "failed",
    DELAYED: "delayed",
} as const;
export type JobState = (typeof JOB_STATE)[keyof typeof JOB_STATE];

export type JobPayload = Record<string, unknown>;

export interface JobHandle<TQueue extends string = string> {
    readonly id: string;
    readonly queue: TQueue;
    readonly name: string;
}

export interface JobInfo {
    readonly id: string;
    readonly name: string;
    readonly state: JobState;
    readonly attemptsMade: number;
    readonly failedReason?: string;
}

export interface JobContext {
    readonly jobId: string;
    readonly attempt: number;
    readonly signal: AbortSignal;
}

export interface BackoffOptions {
    readonly type: "exponential" | "fixed";
    readonly delayMs: number;
}

export interface EnqueueOptions {
    readonly delayMs?: number;
    readonly attempts?: number;
    readonly backoff?: BackoffOptions;
    readonly priority?: number;
    readonly jobId?: string;
    readonly removeOnComplete?: boolean | number;
    readonly removeOnFail?: boolean | number;
}

export type RepeatOptions =
    { pattern: string; tz?: string; every?: never } | { every: number; pattern?: never; tz?: never };
