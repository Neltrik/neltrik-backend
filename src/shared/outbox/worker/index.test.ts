import type { OutboxHandler, OutboxRepository } from "../contracts";
import { HandlersRegistry } from "../handlers-registry";
import type { OutboxEventRecord } from "../types";
import { OutboxWorker } from "./";

describe("OutboxWorker", () => {
    let worker: OutboxWorker;
    let outboxRepository: jest.Mocked<OutboxRepository>;
    let handlersRegistry: HandlersRegistry;
    let getHandlerSpy: jest.SpyInstance;
    let handler: jest.Mocked<OutboxHandler>;

    const events: OutboxEventRecord[] = [
        {
            id: "event-123",
            eventType: "USER_CREATED",
            payload: { userId: "user-123" },
            attempts: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
    ];

    beforeEach(() => {
        outboxRepository = {
            findPending: jest.fn().mockResolvedValue(events),
            markProcessed: jest.fn().mockResolvedValue(undefined),
            markFailed: jest.fn().mockResolvedValue(undefined),
            create: jest.fn().mockResolvedValue(undefined),
        };
        handler = { eventType: "USER_CREATED", handle: jest.fn().mockResolvedValue(undefined) };
        handlersRegistry = new HandlersRegistry();
        getHandlerSpy = jest.spyOn(handlersRegistry, "get").mockReturnValue(handler);
        worker = new OutboxWorker(outboxRepository, handlersRegistry);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should process pending events with default limit", async () => {
        await worker.process();
        expect(outboxRepository.findPending).toHaveBeenCalledWith(10);
    });

    it("should process pending events with provided limit", async () => {
        await worker.process(5);
        expect(outboxRepository.findPending).toHaveBeenCalledWith(5);
    });

    it("should retrieve the handler using the event type", async () => {
        await worker.process();
        expect(getHandlerSpy).toHaveBeenCalledWith("USER_CREATED");
    });

    it("should handle matching events and mark them as processed", async () => {
        await worker.process();
        expect(handler.handle).toHaveBeenCalledWith(events[0]);
        expect(outboxRepository.markProcessed).toHaveBeenCalledWith("event-123");
        expect(outboxRepository.markFailed).not.toHaveBeenCalled();
    });

    it("should mark events as failed when no handler exists for the event type", async () => {
        const unmatchedEvent: OutboxEventRecord = {
            id: "event-123",
            eventType: "ORDER_CREATED",
            payload: { userId: "user-123" },
            attempts: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        };
        outboxRepository.findPending.mockResolvedValue([unmatchedEvent]);
        getHandlerSpy.mockReturnValue(undefined);
        await worker.process();
        expect(handler.handle).not.toHaveBeenCalled();
        expect(outboxRepository.markFailed).toHaveBeenCalledWith("event-123", "No handler for ORDER_CREATED");
        expect(outboxRepository.markProcessed).not.toHaveBeenCalled();
    });

    it("should mark events as failed when handler throws an error", async () => {
        handler.handle.mockRejectedValue(new Error("Processing failed"));
        await worker.process();
        expect(outboxRepository.markFailed).toHaveBeenCalledWith("event-123", "Processing failed");
        expect(outboxRepository.markProcessed).not.toHaveBeenCalled();
    });

    it("should continue processing remaining events when one event fails", async () => {
        const secondEvent: OutboxEventRecord = {
            id: "event-456",
            eventType: "USER_CREATED",
            payload: { userId: "user-456" },
            attempts: 0,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        };
        outboxRepository.findPending.mockResolvedValue([...events, secondEvent]);
        handler.handle.mockRejectedValueOnce(new Error("Processing failed")).mockResolvedValueOnce(undefined);
        await worker.process();
        expect(handler.handle).toHaveBeenCalledTimes(2);
        expect(outboxRepository.markFailed).toHaveBeenCalledWith("event-123", "Processing failed");
        expect(outboxRepository.markProcessed).toHaveBeenCalledWith("event-456");
    });

    it("should not process anything when there are no pending events", async () => {
        outboxRepository.findPending.mockResolvedValue([]);
        await worker.process();
        expect(getHandlerSpy).not.toHaveBeenCalled();
        expect(handler.handle).not.toHaveBeenCalled();
        expect(outboxRepository.markProcessed).not.toHaveBeenCalled();
        expect(outboxRepository.markFailed).not.toHaveBeenCalled();
    });
});
