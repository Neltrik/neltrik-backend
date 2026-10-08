import type { JobContext, JobPayload } from "../../types";

export interface JobHandler<TQueue extends string = string, TPayload extends JobPayload = JobPayload> {
    readonly queue: TQueue;
    readonly name: string;
    handle(payload: TPayload, ctx: JobContext): Promise<void>;
}
