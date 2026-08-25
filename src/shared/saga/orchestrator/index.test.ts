import type { SagaStep } from "../";
import { SagaOrchestrator } from "./index";

type TestContext = {
    value: number;
};

describe("SagaOrchestrator", () => {
    it("should execute all steps in order and return the final context", async () => {
        const context: TestContext = { value: 0 };
        const step1: SagaStep<TestContext> = {
            execute: jest.fn(async (ctx) => {
                await Promise.resolve();
                ctx.value += 1;
            }),
        };
        const step2: SagaStep<TestContext> = {
            execute: jest.fn(async (ctx) => {
                await Promise.resolve();
                ctx.value += 2;
            }),
        };
        const result = await SagaOrchestrator.execute([step1, step2], context);
        expect(result).toEqual({ value: 3 });
        expect(step1.execute).toHaveBeenCalledTimes(1);
        expect(step2.execute).toHaveBeenCalledTimes(1);
    });

    it("should execute steps in the correct order", async () => {
        const executionOrder: number[] = [];
        const step1: SagaStep<TestContext> = {
            execute: jest.fn(async () => {
                await Promise.resolve();
                executionOrder.push(1);
            }),
        };
        const step2: SagaStep<TestContext> = {
            execute: jest.fn(async () => {
                await Promise.resolve();
                executionOrder.push(2);
            }),
        };
        const step3: SagaStep<TestContext> = {
            execute: jest.fn(async () => {
                await Promise.resolve();
                executionOrder.push(3);
            }),
        };
        await SagaOrchestrator.execute([step1, step2, step3]);
        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it("should pass the same context to every step", async () => {
        const initialContext: TestContext = { value: 10 };
        const step1: SagaStep<TestContext> = {
            execute: jest.fn(async (ctx) => {
                await Promise.resolve();
                ctx.value += 5;
            }),
        };
        const step2: SagaStep<TestContext> = {
            execute: jest.fn(async (ctx) => {
                await Promise.resolve();
                ctx.value += 10;
            }),
        };
        const result = await SagaOrchestrator.execute([step1, step2], initialContext);
        expect(step1.execute).toHaveBeenCalledWith(result);
        expect(step2.execute).toHaveBeenCalledWith(result);
        expect(result).toEqual({ value: 25 });
    });

    it("should stop executing steps when a step fails", async () => {
        const error = new Error("Step failed");
        const step1: SagaStep<TestContext> = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        const step2: SagaStep<TestContext> = {
            execute: jest.fn().mockRejectedValue(error),
        };
        const step3: SagaStep<TestContext> = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        await expect(SagaOrchestrator.execute([step1, step2, step3])).rejects.toThrow("Step failed");
        expect(step1.execute).toHaveBeenCalledTimes(1);
        expect(step2.execute).toHaveBeenCalledTimes(1);
        expect(step3.execute).not.toHaveBeenCalled();
    });

    it("should compensate executed steps in reverse order", async () => {
        const compensationOrder: number[] = [];
        const step1: SagaStep<TestContext> = {
            execute: jest.fn().mockResolvedValue(undefined),
            compensate: jest.fn(async () => {
                await Promise.resolve();
                compensationOrder.push(1);
            }),
        };
        const step2: SagaStep<TestContext> = {
            execute: jest.fn().mockResolvedValue(undefined),
            compensate: jest.fn(async () => {
                await Promise.resolve();
                compensationOrder.push(2);
            }),
        };
        const step3: SagaStep<TestContext> = {
            execute: jest.fn().mockRejectedValue(new Error("Step failed")),
            compensate: jest.fn(async () => {
                await Promise.resolve();
                compensationOrder.push(3);
            }),
        };
        await expect(SagaOrchestrator.execute([step1, step2, step3])).rejects.toThrow("Step failed");
        expect(compensationOrder).toEqual([2, 1]);
        expect(step3.compensate).not.toHaveBeenCalled();
    });

    it("should not compensate steps without a compensate function", async () => {
        const step1: SagaStep<TestContext> = {
            execute: jest.fn().mockResolvedValue(undefined),
        };
        const step2: SagaStep<TestContext> = {
            execute: jest.fn().mockResolvedValue(undefined),
            compensate: jest.fn().mockResolvedValue(undefined),
        };
        const step3: SagaStep<TestContext> = {
            execute: jest.fn().mockRejectedValue(new Error("Step failed")),
        };
        await expect(SagaOrchestrator.execute([step1, step2, step3])).rejects.toThrow("Step failed");
        expect(step2.compensate).toHaveBeenCalledTimes(1);
    });

    it("should propagate the original error", async () => {
        const error = new Error("Original error");
        const step: SagaStep<TestContext> = {
            execute: jest.fn().mockRejectedValue(error),
        };
        await expect(SagaOrchestrator.execute([step])).rejects.toBe(error);
    });

    it("should use the initial context", async () => {
        const step: SagaStep<TestContext> = {
            execute: jest.fn(async (ctx) => {
                await Promise.resolve();
                ctx.value += 10;
            }),
        };
        const result = await SagaOrchestrator.execute([step], { value: 5 });
        expect(result).toEqual({ value: 15 });
        expect(step.execute).toHaveBeenCalledWith(result);
    });
});
