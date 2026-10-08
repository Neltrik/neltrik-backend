import { Queue } from "bullmq";

import type { EnqueueOptions, JobPayload, RepeatOptions } from "../../types";
import { BullJobSchedulerAdapter } from "./";

jest.mock("bullmq", () => ({
    Queue: jest.fn(),
}));

describe("BullJobSchedulerAdapter", () => {
    let adapter: BullJobSchedulerAdapter;
    let connection: object;
    let queue: { add: jest.Mock; upsertJobScheduler: jest.Mock; getJob: jest.Mock; close: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
        connection = {};
        queue = { add: jest.fn(), upsertJobScheduler: jest.fn(), getJob: jest.fn(), close: jest.fn() };
        (Queue as unknown as jest.Mock).mockImplementation(() => queue);
        adapter = new BullJobSchedulerAdapter(connection as never);
    });

    describe("enqueue", () => {
        it("should enqueue a job", async () => {
            queue.add.mockResolvedValue({ id: "job-1", queueName: "emails", name: "send-email" });
            const payload: JobPayload = { email: "test@example.com" };
            const result = await adapter.enqueue("emails", "send-email", payload);
            expect(Queue).toHaveBeenCalledWith("emails", { connection });
            expect(queue.add).toHaveBeenCalledWith("send-email", payload, {});
            expect(result).toEqual({ id: "job-1", queue: "emails", name: "send-email" });
        });

        it("should map enqueue options", async () => {
            queue.add.mockResolvedValue({ id: "job-1", queueName: "emails", name: "send-email" });
            const payload: JobPayload = { email: "test@example.com" };
            const options: EnqueueOptions = {
                delayMs: 1000,
                attempts: 3,
                backoff: { type: "exponential", delayMs: 500 },
                priority: 1,
                jobId: "custom-job-id",
                removeOnComplete: true,
                removeOnFail: false,
            };
            await adapter.enqueue("emails", "send-email", payload, options);
            expect(queue.add).toHaveBeenCalledWith("send-email", payload, {
                delay: 1000,
                attempts: 3,
                backoff: { type: "exponential", delay: 500 },
                priority: 1,
                jobId: "custom-job-id",
                removeOnComplete: true,
                removeOnFail: false,
            });
        });

        it("should return an empty id when the job has no id", async () => {
            queue.add.mockResolvedValue({ queueName: "emails", name: "send-email" });
            const result = await adapter.enqueue("emails", "send-email", {});
            expect(result).toEqual({ id: "", queue: "emails", name: "send-email" });
        });
    });

    describe("schedule", () => {
        it("should schedule a job", async () => {
            queue.upsertJobScheduler.mockResolvedValue({ id: "scheduled-job-1", queueName: "emails" });
            const payload: JobPayload = { email: "test@example.com" };
            const repeat: RepeatOptions = { every: 60_000 };
            const result = await adapter.schedule("emails", "send-email", payload, repeat);
            expect(queue.upsertJobScheduler).toHaveBeenCalledWith("emails:send-email", repeat, {
                name: "send-email",
                data: payload,
                opts: {},
            });
            expect(result).toEqual({ id: "scheduled-job-1", queue: "emails", name: "send-email" });
        });

        it("should map enqueue options when scheduling", async () => {
            queue.upsertJobScheduler.mockResolvedValue({ id: "scheduled-job-1", queueName: "emails" });
            const options: EnqueueOptions = { delayMs: 1000, attempts: 3, priority: 2, jobId: "job-1" };
            const repeat: RepeatOptions = { every: 60_000 };
            await adapter.schedule("emails", "send-email", {}, repeat, options);
            expect(queue.upsertJobScheduler).toHaveBeenCalledWith("emails:send-email", repeat, {
                name: "send-email",
                data: {},
                opts: { delay: 1000, attempts: 3, priority: 2, jobId: "job-1" },
            });
        });

        it("should return an empty id when the scheduled job id is undefined", async () => {
            queue.upsertJobScheduler.mockResolvedValue({ id: undefined, queueName: "emails" });
            const payload: JobPayload = { email: "test@example.com" };
            const repeat: RepeatOptions = { every: 60_000 };
            const result = await adapter.schedule("emails", "send-email", payload, repeat);
            expect(result).toEqual({ id: "", queue: "emails", name: "send-email" });
        });
    });

    describe("cancel", () => {
        it("should return false when the job does not exist", async () => {
            queue.getJob.mockResolvedValue(undefined);
            const result = await adapter.cancel("emails", "job-1");
            expect(queue.getJob).toHaveBeenCalledWith("job-1");
            expect(result).toBe(false);
        });

        it.each(["completed", "failed", "active"])("should return false when the job state is %s", async (state) => {
            const job = { getState: jest.fn().mockResolvedValue(state), remove: jest.fn() };
            queue.getJob.mockResolvedValue(job);
            const result = await adapter.cancel("emails", "job-1");
            expect(job.getState).toHaveBeenCalled();
            expect(job.remove).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it.each(["waiting", "delayed"])("should remove a %s job", async (state) => {
            const job = {
                getState: jest.fn().mockResolvedValue(state),
                remove: jest.fn().mockResolvedValue(undefined),
            };
            queue.getJob.mockResolvedValue(job);
            const result = await adapter.cancel("emails", "job-1");
            expect(job.remove).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should return false when removing the job fails", async () => {
            const job = {
                getState: jest.fn().mockResolvedValue("waiting"),
                remove: jest.fn().mockRejectedValue(new Error("Redis error")),
            };
            queue.getJob.mockResolvedValue(job);
            const result = await adapter.cancel("emails", "job-1");
            expect(result).toBe(false);
        });
    });

    describe("queue management", () => {
        it("should reuse the same queue for the same name", async () => {
            queue.add
                .mockResolvedValueOnce({ id: "job-1", queueName: "emails", name: "job-1" })
                .mockResolvedValueOnce({ id: "job-2", queueName: "emails", name: "job-2" });
            await adapter.enqueue("emails", "job-1", {});
            await adapter.enqueue("emails", "job-2", {});
            expect(Queue).toHaveBeenCalledTimes(1);
        });

        it("should create different queues for different names", async () => {
            queue.add.mockResolvedValue({ id: "job-1", queueName: "emails", name: "job-1" });
            await adapter.enqueue("emails", "job-1", {});
            await adapter.enqueue("notifications", "job-2", {});
            expect(Queue).toHaveBeenCalledTimes(2);
            expect(Queue).toHaveBeenNthCalledWith(1, "emails", { connection });
            expect(Queue).toHaveBeenNthCalledWith(2, "notifications", { connection });
        });
    });

    describe("onModuleDestroy", () => {
        it("should close all queues and clear the queue map", async () => {
            queue.add.mockResolvedValue({ id: "job-1", queueName: "emails", name: "job-1" });
            await adapter.enqueue("emails", "job-1", {});
            await adapter.enqueue("notifications", "job-2", {});
            await adapter.onModuleDestroy();
            expect(queue.close).toHaveBeenCalledTimes(2);
            await adapter.enqueue("emails", "job-3", {});
            expect(Queue).toHaveBeenCalledTimes(3);
        });
    });
});
