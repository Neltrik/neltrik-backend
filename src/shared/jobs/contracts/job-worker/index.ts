import { type JobHandler } from "../job-handler";

export abstract class JobWorker {
    public abstract start(handlers: JobHandler[]): Promise<void>;
    public abstract stop(): Promise<void>;
}
