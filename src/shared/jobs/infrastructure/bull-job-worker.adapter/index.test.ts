import { Worker } from "bullmq";

import type { JobHandler } from "../../contracts/job-handler";
import { BullJobWorkerAdapter } from "./";

jest.mock("bullmq", () => ({ Worker: jest.fn() }));

type TestJob = { id?: string; name: string; data: unknown; attemptsMade: number };
type WorkerProcessor = (job: TestJob) => Promise<void>;

describe("BullJobWorkerAdapter", () => {
    let adapter: BullJobWorkerAdapter;
    let connection: object;
    let worker: {
        waitUntilReady: jest.Mock;
        close: jest.Mock;
        processor?: WorkerProcessor;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        connection = {};
        worker = {
            waitUntilReady: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
        };
        (Worker as unknown as jest.Mock).mockImplementation((_queue: string, processor: WorkerProcessor) => {
            worker.processor = processor;
            return worker;
        });
        adapter = new BullJobWorkerAdapter(connection as never);
    });

    it("should throw when no handlers are provided", async () => {
        await expect(adapter.start([])).rejects.toThrow("BullJobWorkerAdapter: no handlers provided");
        expect(Worker).not.toHaveBeenCalled();
    });

    it("should create one worker per queue", async () => {
        const handlers: JobHandler[] = [
            { name: "send-email", queue: "emails", handle: jest.fn() },
            { name: "retry-email", queue: "emails", handle: jest.fn() },
            { name: "send-notification", queue: "notifications", handle: jest.fn() },
        ];
        await adapter.start(handlers);
        expect(Worker).toHaveBeenCalledTimes(2);
        expect(Worker).toHaveBeenNthCalledWith(1, "emails", expect.any(Function), { connection });
        expect(Worker).toHaveBeenNthCalledWith(2, "notifications", expect.any(Function), { connection });
    });

    it("should not start workers twice", async () => {
        const handlers: JobHandler[] = [{ name: "send-email", queue: "emails", handle: jest.fn() }];
        await adapter.start(handlers);
        await adapter.start(handlers);
        expect(Worker).toHaveBeenCalledTimes(1);
    });

    it("should stop workers when initialization fails", async () => {
        const close = jest.fn().mockResolvedValue(undefined);
        (Worker as unknown as jest.Mock).mockImplementation(() => ({
            waitUntilReady: jest.fn().mockRejectedValue(new Error("Failed")),
            close,
        }));
        const handlers: JobHandler[] = [{ name: "send-email", queue: "emails", handle: jest.fn() }];
        await expect(adapter.start(handlers)).rejects.toThrow("Failed");
        expect(close).toHaveBeenCalled();
    });

    it("should process the matching handler", async () => {
        const handle = jest.fn().mockResolvedValue(undefined);
        const handler: JobHandler = { name: "send-email", queue: "emails", handle };
        await adapter.start([handler]);
        const job: TestJob = { id: "job-1", name: "send-email", data: { email: "test@example.com" }, attemptsMade: 1 };
        await worker.processor?.(job);
        expect(handle).toHaveBeenCalledWith(job.data, expect.objectContaining({ jobId: "job-1", attempt: 2 }));
    });

    it("should throw when no handler matches", async () => {
        const handler: JobHandler = { name: "send-email", queue: "emails", handle: jest.fn() };
        await adapter.start([handler]);
        const job: TestJob = { id: "job-1", name: "unknown", data: {}, attemptsMade: 0 };
        await expect(worker.processor?.(job)).rejects.toThrow('No handler found for job "unknown"');
    });

    it("should close all workers on stop", async () => {
        const handlers: JobHandler[] = [
            { name: "send-email", queue: "emails", handle: jest.fn() },
            { name: "send-notification", queue: "notifications", handle: jest.fn() },
        ];
        const emailsWorker = {
            waitUntilReady: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
        };
        const notificationsWorker = {
            waitUntilReady: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined),
        };
        (Worker as unknown as jest.Mock)
            .mockImplementationOnce(() => emailsWorker)
            .mockImplementationOnce(() => notificationsWorker);
        await adapter.start(handlers);
        await adapter.stop();
        expect(emailsWorker.close).toHaveBeenCalled();
        expect(notificationsWorker.close).toHaveBeenCalled();
    });

    it("should abort active jobs on stop", async () => {
        let signal: AbortSignal | undefined;
        let resolveHandler!: () => void;
        const handlerFinished = new Promise<void>((resolve) => {
            resolveHandler = resolve;
        });
        const handler: JobHandler = {
            name: "send-email",
            queue: "emails",
            handle: jest.fn((_payload, context) => {
                signal = context.signal;
                return handlerFinished;
            }),
        };
        await adapter.start([handler]);
        const jobPromise = worker.processor?.({ id: "job-1", name: "send-email", data: {}, attemptsMade: 0 });
        while (!signal) {
            await Promise.resolve();
        }
        expect(signal.aborted).toBe(false);
        await adapter.stop();
        expect(signal.aborted).toBe(true);
        resolveHandler();
        await jobPromise;
    });

    it("should use an empty job id when the job has no id", async () => {
        const handle = jest.fn().mockResolvedValue(undefined);
        const handler: JobHandler = { name: "send-email", queue: "emails", handle };
        await adapter.start([handler]);
        const job: TestJob = { name: "send-email", data: {}, attemptsMade: 0 };
        await worker.processor?.(job);
        expect(handle).toHaveBeenCalledWith(job.data, expect.objectContaining({ jobId: "", attempt: 1 }));
    });
});
