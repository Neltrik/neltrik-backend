import { type JobScheduler } from "@/shared/jobs";
import { type OutboxEventRecord } from "@/shared/outbox";

import { buildFileScanJobId, FILE_SCAN_JOB, FILE_SCAN_JOB_OPTIONS, FILE_SCAN_QUEUE } from "../../../domain/types";
import { FileScanOutboxHandler } from "./";

describe("FileScanOutboxHandler", () => {
    let handler: FileScanOutboxHandler;
    let jobScheduler: jest.Mocked<JobScheduler>;

    const createEvent = (): OutboxEventRecord => ({
        id: "event-id",
        eventType: "FILE_SCAN",
        payload: { tenantId: "tenant-id", fileId: "file-id", version: 2 },
        attempts: 0,
        createdAt: new Date("2026-01-15T10:30:00.000Z"),
    });

    beforeEach(() => {
        jobScheduler = { enqueue: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<JobScheduler>;
        handler = new FileScanOutboxHandler(jobScheduler);
    });

    it("should have FILE_SCAN as event type", () => {
        expect(handler.eventType).toBe("FILE_SCAN");
    });

    it("should enqueue a file scan job with the correct parameters", async () => {
        const event = createEvent();
        await handler.handle(event);
        expect(jobScheduler.enqueue).toHaveBeenCalledTimes(1);
        expect(jobScheduler.enqueue).toHaveBeenCalledWith(
            FILE_SCAN_QUEUE,
            FILE_SCAN_JOB,
            { tenantId: "tenant-id", fileId: "file-id", version: 2 },
            { ...FILE_SCAN_JOB_OPTIONS, jobId: buildFileScanJobId("file-id", 2) },
        );
    });

    it("should build a unique job id using the file id and version", async () => {
        await handler.handle(createEvent());
        expect(jobScheduler.enqueue).toHaveBeenCalledWith(
            FILE_SCAN_QUEUE,
            FILE_SCAN_JOB,
            { tenantId: "tenant-id", fileId: "file-id", version: 2 },
            expect.objectContaining({ jobId: buildFileScanJobId("file-id", 2) }),
        );
    });

    it("should propagate errors when enqueue fails", async () => {
        const error = new Error("Failed to enqueue file scan job");
        jobScheduler.enqueue.mockRejectedValue(error);
        await expect(handler.handle(createEvent())).rejects.toThrow(error);
        expect(jobScheduler.enqueue).toHaveBeenCalledTimes(1);
    });
});
