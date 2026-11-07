import { type OutboxWorker } from "../worker";
import { OutboxScheduler } from "./";

describe("OutboxScheduler", () => {
    let outboxScheduler: OutboxScheduler;
    let outboxWorker: jest.Mocked<OutboxWorker>;

    beforeEach(() => {
        outboxWorker = {
            process: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<OutboxWorker>;
        outboxScheduler = new OutboxScheduler(outboxWorker);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it("should schedule outbox worker processing on module initialization", () => {
        jest.useFakeTimers();
        outboxScheduler.onModuleInit();
        expect(jest.getTimerCount()).toBe(1);
    });

    it("should process outbox with batch size 10 every 5000 milliseconds", () => {
        jest.useFakeTimers();
        outboxScheduler.onModuleInit();
        jest.advanceTimersByTime(5000);
        expect(outboxWorker.process).toHaveBeenCalledTimes(1);
        expect(outboxWorker.process).toHaveBeenCalledWith(10);
        jest.advanceTimersByTime(5000);
        expect(outboxWorker.process).toHaveBeenCalledTimes(2);
    });

    it("should clear interval on module destruction", () => {
        jest.useFakeTimers();
        outboxScheduler.onModuleInit();
        outboxScheduler.onModuleDestroy();
        jest.advanceTimersByTime(10000);
        expect(outboxWorker.process).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });

    it("should not throw when destroying module without initializing it", () => {
        expect(() => outboxScheduler.onModuleDestroy()).not.toThrow();
    });
});
